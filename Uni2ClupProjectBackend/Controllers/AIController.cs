using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using System.Text.RegularExpressions;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AIController(AppDbContext db)
        {
            _db = db;
        }

        // --------------------------------------------------------
        // 🔥 SON – STABİL – KARARLI KULÜP ÖNERİ MOTORU
        // --------------------------------------------------------
        [HttpGet("recommend-clubs")]
        [Authorize(Roles = "Student,Academic")]
        public async Task<IActionResult> RecommendClubs()
        {
            string raw = "";

            try
            {
                // 1) Kullanıcı bilgisi
                int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var user = await _db.Users.Include(x => x.Department).FirstAsync(x => x.Id == userId);

                // 2) Kullanıcının üye olduğu kulüpler
                var myClubs = await _db.ClubMembers
                    .Where(x => x.UserId == userId)
                    .Include(x => x.Club).ThenInclude(c => c.Department)
                    .Select(x => x.Club!)
                    .ToListAsync();

                // 3) Tüm kulüpler
                var allClubs = await _db.Clubs.Include(c => c.Department).ToListAsync();

                // 4) Kullanıcının üye olmadığı aday kulüpler
                var candidateClubs = allClubs
                    .Where(c => !myClubs.Any(m => m.Id == c.Id))
                    .ToList();

                if (!candidateClubs.Any())
                    return BadRequest("Önerilebilecek kulüp kalmadı.");

                // --------------------------------------------------------
                // CASE 1 — Kullanıcının hiç kulübü yoksa bölüm bazlı öneri
                // --------------------------------------------------------
                if (!myClubs.Any())
                {
                    var deptId = user.DepartmentId;

                    var relatedDeptClubs = candidateClubs
                        .Where(c => c.DepartmentId == deptId)
                        .ToList();

                    var selected = relatedDeptClubs.Any()
                        ? relatedDeptClubs.OrderBy(x => Guid.NewGuid()).First()
                        : candidateClubs.OrderBy(x => Guid.NewGuid()).First();

                    return Ok(new[]
                    {
                        new {
                            club = new {
                                id = selected.Id,
                                name = selected.Name,
                                description = selected.Description,
                                department = new { name = selected.Department?.Name }
                            },
                            related_to = user.Department?.Name ?? "",
                            reason = $"{selected.Name} kulübü bölümünüz ile doğrudan ilişkili olduğu için önerildi."
                        }
                    });
                }

                // --------------------------------------------------------
                // CASE 2 — Kullanıcının kulüpleri var → AI devreye giriyor
                // --------------------------------------------------------

                // Kullanıcı kulüplerinden rastgele bir referans seç
                var refClub = myClubs.OrderBy(x => Guid.NewGuid()).First();

                string prompt = $@"
Sen bir üniversite kulüp öneri motorusun.

Görev: Kullanıcının referans kulübüne en çok benzeyen **1 adet** kulübü seç.

Referans Kulüp:
Ad: {refClub.Name}
Bölüm: {refClub.Department?.Name}
Açıklama: {refClub.Description}

Aday Kulüpler (sadece buradaki ID'lerden birini seçebilirsin):
{string.Join("\n", candidateClubs.Select(c => $"ID:{c.Id} | {c.Name} | {c.Department?.Name} | {c.Description}"))}

Kurallar:
- Sadece Aday Kulüp listesindeki ID'lerden birini seç.
- Kullanıcının zaten üye olduğu kulüpleri seçme.
- JSON formatında sadece 1 nesne döndür:
{{
  ""suggested_club_id"": X,
  ""reason"": ""Açıklamalardaki anahtar kelimeler ve bölüm benzerlikleri nedeniyle önerildi.""
}}

Dikkat: Kesinlikle sadece verilen ID'lerden birini seç. Yeni ID üretme.
";

                using var client = new HttpClient();
                client.BaseAddress = new Uri("http://host.docker.internal:11434");

                var payload = new { model = "qwen2.5:7b", prompt = prompt, format = "json", stream = false };
                var aiResponse = await client.PostAsJsonAsync("/api/generate", payload);
                raw = await aiResponse.Content.ReadAsStringAsync();

                // Ollama wrapper temizliği
                if (raw.Contains("\"response\""))
                {
                    var wrapper = JsonSerializer.Deserialize<Dictionary<string, object>>(raw);
                    raw = wrapper?["response"]?.ToString() ?? raw;
                }

                // JSON parse
                var item = JsonSerializer.Deserialize<AiItem>(raw,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (item == null)
                    return BadRequest(new { error = "AI sonuç üretemedi", raw });

                // AI’ın önerdiği ID gerçekten aday listede mi?
                var selectedClub = candidateClubs.FirstOrDefault(c => c.Id == item.SuggestedClubId);
                if (selectedClub == null)
                    return BadRequest(new { error = "AI geçersiz ID döndürdü", raw });

                // Backend %100 doğru ilişkiyi gönderiyor
                string relatedTo = refClub.Name;

                return Ok(new[]
                {
                    new {
                        club = new {
                            id = selectedClub.Id,
                            name = selectedClub.Name,
                            description = selectedClub.Description,
                            department = new { name = selectedClub.Department?.Name }
                        },
                        related_to = relatedTo,
                        reason = CleanReason(item.Reason)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, raw });
            }
        }

        // --------------------------------------------------------
        // 🔥 AI Reason TEMİZLEME FİLTRESİ — ID:3 vb. hepsini yok eder
        // --------------------------------------------------------
        private string CleanReason(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            string cleaned = text;

            // ID:3, ID 3, (ID:3) vb. ifadeleri SİL
            cleaned = Regex.Replace(cleaned, @"ID[: ]*\d+", "", RegexOptions.IgnoreCase);

            // Parantezleri boş bırakıyorsa temizle
            cleaned = Regex.Replace(cleaned, @"\(\s*\)", "", RegexOptions.IgnoreCase);

            // Fazla boşlukları düzelt
            cleaned = Regex.Replace(cleaned, @"\s{2,}", " ");

            return cleaned.Trim();
        }

        // JSON Model
        public class AiItem
        {
            [JsonPropertyName("suggested_club_id")] public int SuggestedClubId { get; set; }
            [JsonPropertyName("reason")] public string Reason { get; set; } = "";
        }
    }
}
