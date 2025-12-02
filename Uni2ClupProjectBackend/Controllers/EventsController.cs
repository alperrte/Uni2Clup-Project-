using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.DTOs;
using Uni2ClupProjectBackend.Models;
using Uni2ClupProjectBackend.Services;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public EventsController(AppDbContext db)
        {
            _db = db;
        }

        // --------------------------------------------------------------------
        // 1) Etkinlik Listesi (Tümünü gösterir)
        // --------------------------------------------------------------------
        [HttpGet("list")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetEvents()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            string? clubName = null;

            if (user?.ClubId != null)
            {
                clubName = await _db.Clubs
                    .Where(c => c.Id == user.ClubId.Value)
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();
            }

            var query = _db.Events.AsQueryable();

            if (!string.IsNullOrEmpty(clubName))
                query = query.Where(e => e.ClubId == user.ClubId);
            else
                query = query.Where(e => e.CreatedBy == email);

            var now = DateTime.UtcNow;

            var events = await query
                .OrderByDescending(e => e.StartDate)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Location,
                    e.Capacity,
                    ClubName = e.Club.Name,
                    e.Description,
                    e.StartDate,
                    e.EndDate,
                    e.IsCancelled,
                    e.CancelReason,
                    Status = e.EndDate < now
                        ? "Bitti"
                        : (e.StartDate > now ? "Yaklaşan" : "Devam Eden")
                })
                .ToListAsync();

            return Ok(events);
        }

        // --------------------------------------------------------------------
        // 2) Sadece kendi oluşturduğu etkinlikler
        // --------------------------------------------------------------------
        [HttpGet("my-events")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetMyEvents()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var now = DateTime.UtcNow;

            var events = await _db.Events
                .Where(e => e.CreatedBy == email)
                .OrderByDescending(e => e.StartDate)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Location,
                    e.Capacity,
                    ClubName = e.Club.Name,
                    e.Description,
                    e.StartDate,
                    e.EndDate,
                    e.IsCancelled,
                    e.CancelReason,
                    Status = e.EndDate < now
                        ? "Bitti"
                        : (e.StartDate > now ? "Yaklaşan" : "Devam Eden")
                })
                .ToListAsync();

            return Ok(events);
        }

        // --------------------------------------------------------------------
        // 3) Etkinlik Oluştur
        // --------------------------------------------------------------------
        [HttpPost("create")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> Create([FromBody] EventCreateDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Etkinlik ismi zorunludur." });

            if (dto.Capacity <= 0)
                return BadRequest(new { message = "Kontenjan 0'dan büyük olmalıdır." });

            var turkeyNow = TimeZoneInfo.ConvertTime(DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));

            var today = turkeyNow.Date;

            if (dto.StartDate.Date < today)
                return BadRequest(new { message = "Geçmiş bir tarih için etkinlik oluşturamazsınız." });

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Bitiş tarihi başlangıç tarihinden önce olamaz." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            var club = await _db.Clubs.FindAsync(user.ClubId.Value);

            var entity = new Event
            {
                Name = dto.Name.Trim(),
                Location = dto.Location.Trim(),
                Capacity = dto.Capacity,
                Description = dto.Description?.Trim() ?? "",
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ClubId = user.ClubId.Value,
                CreatedBy = email
            };

            _db.Events.Add(entity);
            await _db.SaveChangesAsync();

            // Bildirim + mail
            var members = await _db.ClubMembers
                .Where(cm => cm.ClubId == user.ClubId.Value)
                .Include(cm => cm.User)
                .ToListAsync();

            var emailService = HttpContext.RequestServices.GetRequiredService<EmailService>();

            foreach (var m in members)
            {
                _db.Notifications.Add(new Notification
                {
                    UserId = m.UserId,
                    Title = "Yeni Etkinlik",
                    Message = $"{club.Name} kulübü yeni bir etkinlik oluşturdu: {entity.Name}",
                    CreatedAt = DateTime.UtcNow
                });

                await emailService.SendEmailAsync(
                    m.User.Email,
                    $"Yeni Etkinlik: {entity.Name}",
                    $@"
                        <h2>{club.Name} Yeni Etkinlik</h2>
                        <p><b>Etkinlik:</b> {entity.Name}</p>
                        <p><b>Açıklama:</b> {entity.Description}</p>
                        <p><b>Yer:</b> {entity.Location}</p>
                        <p><b>Tarih:</b> {entity.StartDate:dd.MM.yyyy HH:mm}</p>
                    ");
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Etkinlik başarıyla oluşturuldu.",
                eventData = entity
            });
        }

        // --------------------------------------------------------------------
        // 4) Etkinlik Güncelle
        // --------------------------------------------------------------------
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> Update(int id, [FromBody] EventCreateDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var existing = await _db.Events.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            if (!string.Equals(existing.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinliği güncelleme yetkiniz yok." });

            if (existing.IsCancelled)
                return BadRequest(new { message = "İptal edilmiş etkinlik güncellenemez." });

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Bitiş tarihi başlangıç tarihinden önce olamaz." });

            // ✔ Eski değerleri sakla
            var oldName = existing.Name;
            var oldCapacity = existing.Capacity;
            var oldLocation = existing.Location;
            var oldStart = existing.StartDate;
            var oldEnd = existing.EndDate;

            // ✔ Güncelle
            existing.Name = dto.Name.Trim();
            existing.Location = dto.Location.Trim();
            existing.Description = dto.Description?.Trim() ?? "";
            existing.Capacity = dto.Capacity;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;

            await _db.SaveChangesAsync();

            // ✔ Değişiklik listesi
            List<string> changes = new List<string>();

            if (oldName != existing.Name)
                changes.Add($"Etkinlik adı '{oldName}' → '{existing.Name}' olarak güncellendi.");

            if (oldLocation != existing.Location)
                changes.Add($"Etkinlik yeri '{oldLocation}' → '{existing.Location}' olarak güncellendi.");

            if (oldCapacity != existing.Capacity)
            {
                int diff = existing.Capacity - oldCapacity;
                if (diff > 0)
                    changes.Add($"Kontenjan {diff} kişi artırıldı.");
                else
                    changes.Add($"Kontenjan {Math.Abs(diff)} kişi azaltıldı.");
            }

            if (oldStart != existing.StartDate || oldEnd != existing.EndDate)
                changes.Add($"Etkinliğin tarihi {oldStart:dd.MM.yyyy HH:mm} → {existing.StartDate:dd.MM.yyyy HH:mm} olarak güncellendi.");

            return Ok(new
            {
                message = "✏️ Etkinlik başarıyla güncellendi.",
                changes = changes
            });
        }

        // --------------------------------------------------------------------
        // 6) Etkinlik İptal Et (Neden ile birlikte)
        // --------------------------------------------------------------------
        [HttpPut("cancel/{id}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> CancelEvent(int id, [FromBody] CancelEventDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "İptal nedeni zorunludur." });

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });

            var ev = await _db.Events.FindAsync(id);
            if (ev == null)
                return NotFound(new { message = "Etkinlik bulunamadı." });

            if (!string.Equals(ev.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinlik üzerinde yetkiniz yok." });

            // Etkinliği iptal edilmiş gibi işaretle (şimdilik açıklamaya ekliyoruz)
            ev.Description += $"\n\n[İPTAL EDİLDİ] Neden: {dto.Reason}";
            await _db.SaveChangesAsync();

            return Ok(new { message = "Etkinlik başarıyla iptal edildi." });
        }

        public class CancelEventDto
        {
            public string Reason { get; set; }
        }

