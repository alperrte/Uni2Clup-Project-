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
        // 1) Kulüp yöneticisinin panelde göreceği etkinlik listesi
        //    (filtre: tüm etkinlikler)
        //    GET /api/events/list
        // --------------------------------------------------------------------
        [HttpGet("list")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetEvents()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            // Kullanıcıyı ve kulübünü bul
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            string? clubName = null;

            if (user?.ClubId != null)
            {
                clubName = await _db.Clubs
                    .Where(c => c.Id == user.ClubId.Value)
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();
            }

            // Sorgu
            var query = _db.Events.AsQueryable();

            // Eğer kulüp bulunduysa sadece o kulübün etkinlikleri
            if (!string.IsNullOrEmpty(clubName))
            {
                query = query.Where(e => e.ClubId == user.ClubId);
            }
            // Kulüp yoksa, sadece kendisinin oluşturdukları (emniyet için)
            else
            {
                query = query.Where(e => e.CreatedBy == email);
            }

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
                    Status = e.EndDate < now
                        ? "Bitti"
                        : (e.StartDate > now ? "Yaklaşan" : "Devam Eden")
                })
                .ToListAsync();

            return Ok(events);
        }

        // --------------------------------------------------------------------
        // 2) Sadece KENDİ OLUŞTURDUĞUM etkinlikler
        //    GET /api/events/my-events
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
                    Status = e.EndDate < now
                        ? "Bitti"
                        : (e.StartDate > now ? "Yaklaşan" : "Devam Eden")
                })
                .ToListAsync();

            return Ok(events);
        }

        // --------------------------------------------------------------------
        // 3) Etkinlik Oluştur (Yeni Etkinlik Oluştur sayfası)
        //    POST /api/events/create
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

            var today = DateTime.UtcNow.Date;

            if (dto.StartDate.Date < today)
                return BadRequest(new { message = "Geçmiş bir tarih için etkinlik oluşturamazsınız." });

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Bitiş tarihi, başlangıç tarihinden önce olamaz." });

            // Kullanıcının kulübünü bul
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
            await _db.SaveChangesAsync(); // ✔ İlk kayıt

            // ------------------------------------------------------------
            // ⭐⭐ YENİ EKLENDİ: Üyelere bildirim + mail gönderme
            // ------------------------------------------------------------
            var members = await _db.ClubMembers
                .Where(cm => cm.ClubId == user.ClubId.Value)
                .Include(cm => cm.User)
                .ToListAsync();

            var emailService = HttpContext.RequestServices.GetRequiredService<EmailService>();

            foreach (var m in members)
            {
                // 1) Bildirim
                _db.Notifications.Add(new Notification
                {
                    UserId = m.UserId,
                    Title = "Yeni Etkinlik",
                    Message = $"{club.Name} kulübü yeni bir etkinlik oluşturdu: {entity.Name}",
                    CreatedAt = DateTime.UtcNow
                });

                // 2) Mail gönderimi
                await emailService.SendEmailAsync(
                    m.User.Email,
                    $"Yeni Etkinlik: {entity.Name}",
                    $@"
                <h2>{club.Name} Yeni Etkinlik Duyurusu</h2>
                <p><b>Etkinlik:</b> {entity.Name}</p>
                <p><b>Açıklama:</b> {entity.Description}</p>
                <p><b>Yer:</b> {entity.Location}</p>
                <p><b>Tarih:</b> {entity.StartDate:dd.MM.yyyy HH:mm} - {entity.EndDate:dd.MM.yyyy HH:mm}</p>
            "
                );
            }

            await _db.SaveChangesAsync(); // ✔ Bildirimleri kaydediyoruz

            return Ok(new
            {
                message = "✅ Etkinlik başarıyla oluşturuldu.",
                eventData = entity
            });
        }

        [HttpGet("participants/{eventId}")]
        public async Task<IActionResult> GetParticipants(int eventId)
        {
            var list = await _db.EventParticipants
                .Where(ep => ep.EventId == eventId)
                .Include(ep => ep.User)
                .ThenInclude(u => u.Department)  // ⭐ Bölümü dahil ettik
                .Select(ep => new
                {
                    ep.User.Id,
                    ep.User.Name,
                    ep.User.Surname,
                    ep.User.Email,
                    DepartmentName = ep.User.Department != null ? ep.User.Department.Name : "-",
                    ep.JoinedAt
                })
                .ToListAsync();

            return Ok(list);
        }




        // --------------------------------------------------------------------
        // 4) Etkinlik Güncelle (sağdaki kalem butonu)
        //    PUT /api/events/update/{id}
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

            // Sadece kendi oluşturduğu etkinliği güncelleyebilsin
            if (!string.Equals(existing.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinliği güncelleme yetkiniz yok." });

            var today = DateTime.UtcNow.Date;

            if (dto.StartDate.Date < today)
                return BadRequest(new { message = "Geçmiş tarihli bir etkinlik tarihi belirleyemezsiniz." });

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Bitiş tarihi, başlangıç tarihinden önce olamaz." });

            existing.Name = dto.Name.Trim();
            existing.Location = dto.Location.Trim();
            existing.Description = dto.Description?.Trim() ?? "";
            existing.Capacity = dto.Capacity;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;

            await _db.SaveChangesAsync();

            return Ok(new { message = "✏️ Etkinlik güncellendi." });
        }

        // --------------------------------------------------------------------
        // 5) Etkinlik Sil (çöp kutusu)
        //    DELETE /api/events/delete/{id}
        // --------------------------------------------------------------------
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> Delete(int id)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var existing = await _db.Events.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            if (!string.Equals(existing.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinliği silme yetkiniz yok." });

            _db.Events.Remove(existing);
            await _db.SaveChangesAsync();

            return Ok(new { message = "🗑️ Etkinlik silindi." });
        }
    }
}