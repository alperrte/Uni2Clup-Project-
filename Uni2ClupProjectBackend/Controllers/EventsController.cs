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


        // 1) Etkinlik Listesi (Tümünü gösterir)
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

        // Tüm Kulüp Üyelerini Getir
        private async Task<List<User>> GetClubMembersUsers(int clubId)
        {
            return await _db.ClubMembers
                .Where(cm => cm.ClubId == clubId)
                .Include(cm => cm.User)
                .Select(cm => cm.User)
                .ToListAsync();
        }

        // Kulüp Üyelerine Bildirim Gönder
        private async Task SendNotificationToClubMembers(int clubId, string title, string message)
        {
            var users = await GetClubMembersUsers(clubId);

            foreach (var user in users)
            {
                _db.Notifications.Add(new Notification
                {
                    UserId = user.Id,
                    Title = title,
                    Message = message,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();
        }


        // 2) Sadece kendi oluşturduğu etkinlikler
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


        // 3) Etkinlik Oluştur
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


        // 4) Etkinlik Güncelle
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> Update(int id, [FromBody] EventCreateDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var ev = await _db.Events.FindAsync(id);
            if (ev == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            if (!string.Equals(ev.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinliği güncelleme yetkiniz yok." });

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Bitiş tarihi başlangıç tarihinden önce olamaz." });



            var oldName = ev.Name;
            var oldCapacity = ev.Capacity;
            var oldLocation = ev.Location;
            var oldStart = ev.StartDate;
            var oldEnd = ev.EndDate;


            ev.Name = dto.Name.Trim();
            ev.Location = dto.Location.Trim();
            ev.Description = dto.Description?.Trim() ?? "";
            ev.Capacity = dto.Capacity;
            ev.StartDate = dto.StartDate;
            ev.EndDate = dto.EndDate;

            await _db.SaveChangesAsync();



            List<string> changeMessages = new();


  
            if (oldName != ev.Name)
            {
                string msg = $"“{oldName}” etkinliğinin adı “{ev.Name}” olarak güncellenmiştir.";
                await SendNotificationToClubMembers(ev.ClubId, "Etkinlik Adı Güncellendi", msg);
                changeMessages.Add(msg);
            }


            if (oldCapacity != ev.Capacity)
            {
                int diff = ev.Capacity - oldCapacity;
                string msg = diff > 0
                    ? $"“{ev.Name}” etkinliğinin kontenjanı {diff} kişi artırılmıştır."
                    : $"“{ev.Name}” etkinliğinin kontenjanı {Math.Abs(diff)} kişi azaltılmıştır.";

                await SendNotificationToClubMembers(ev.ClubId, "Kontenjan Güncellendi", msg);
                changeMessages.Add(msg);
            }

            if (oldLocation != ev.Location)
            {
                string msg = $"“{ev.Name}” etkinliğinin yeri “{ev.Location}” olarak güncellenmiştir.";
                await SendNotificationToClubMembers(ev.ClubId, "Yer Güncellendi", msg);
                changeMessages.Add(msg);
            }

            if (oldStart != ev.StartDate || oldEnd != ev.EndDate)
            {
                string msg =
                    $"“{ev.Name}” etkinliğinin tarihi " +
                    $"{oldStart:dd.MM.yyyy HH:mm} → {ev.StartDate:dd.MM.yyyy HH:mm} olarak güncellenmiştir.";

                await SendNotificationToClubMembers(ev.ClubId, "Tarih Güncellendi", msg);
                changeMessages.Add(msg);
            }



            return Ok(new
            {
                message = "✔ Etkinlik güncellendi.",
                changes = changeMessages
            });
        }


        // Etkinliğe Katılan Öğrenciler
        [HttpGet("participants/{eventId}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetParticipants(int eventId)
        {
            var ev = await _db.Events.FindAsync(eventId);
            if (ev == null)
                return NotFound(new { message = "Etkinlik bulunamadı." });

            var participants = await _db.EventParticipants
                .Where(ep => ep.EventId == eventId)
                .Include(ep => ep.User)
                .Select(ep => new
                {
                    ep.User.Id,
                    ep.User.Name,
                    ep.User.Surname,
                    ep.User.Email,
                    departmentName = ep.User.Department != null ? ep.User.Department.Name : "-",
                    joinedAt = ep.JoinedAt
                })
                .ToListAsync();

            return Ok(participants);
        }

        // 🔥 İptal Edilen Etkinlikleri Listele
        [HttpGet("cancelled")]
        [Authorize(Roles = "Admin,ClubManager")]
        public async Task<IActionResult> GetCancelledEvents()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            var query = _db.Events
                .Where(e => e.IsCancelled == true)
                .Include(e => e.Club)
                .OrderByDescending(e => e.StartDate)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Location,
                    e.Capacity,
                    ClubName = e.Club.Name,
                    e.Description,
                    e.CancelReason,
                    e.StartDate,
                    e.EndDate,
                    e.ClubId
                });

            // ClubManager sadece kendi kulübünün iptal edilen etkinliklerini görür
            if (user.Role == "ClubManager" && user.ClubId != null)
                query = query.Where(e => e.ClubId == user.ClubId);

            var cancelledEvents = await query.ToListAsync();

            return Ok(cancelledEvents);
        }

        // 6) Etkinlik Değerlendirme Özeti
        [HttpGet("{eventId}/ratings-summary")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetRatingSummary(int eventId)
        {
            var ratings = await _db.EventRatings
                .Where(r => r.EventId == eventId)
                .ToListAsync();

            if (!ratings.Any())
                return Ok(new { percent = 0, total = 0 });

            // Her öğrenci 5 soru × 5 puan = max 25 puan verebilir
            int maxPossiblePoints = ratings.Count * 25;

            // Tüm öğrencilerin verdiği toplam puan
            int totalGivenPoints = ratings.Sum(r => r.Q1 + r.Q2 + r.Q3 + r.Q4 + r.Q5);

            // Gerçek beğenilme yüzdesi
            double percent = Math.Round((double)totalGivenPoints / maxPossiblePoints * 100, 2);

            return Ok(new
            {
                percent,
                total = ratings.Count
            });
        }




        //Etkinlik İptal Et 
        [HttpPut("cancel/{id}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> CancelEvent(int id, [FromBody] CancelEventDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "İptal nedeni zorunludur." });

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "Kullanıcı oturumu bulunamadı." });

            var ev = await _db.Events
                .Include(e => e.Club)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (ev == null)
                return NotFound(new { message = "Etkinlik bulunamadı." });

            if (!string.Equals(ev.CreatedBy, email, StringComparison.OrdinalIgnoreCase))
                return StatusCode(403, new { message = "Bu etkinlik üzerinde yetkiniz yok." });

            ev.Description += $"\n\n[İPTAL EDİLDİ] Neden: {dto.Reason}";
            ev.IsCancelled = true;
            ev.CancelReason = dto.Reason;

            var members = await _db.ClubMembers
                .Where(cm => cm.ClubId == ev.ClubId)
                .Include(cm => cm.User)
                .ToListAsync();

            var emailService = HttpContext.RequestServices.GetRequiredService<EmailService>();

            foreach (var m in members)
            {

                _db.Notifications.Add(new Notification
                {
                    UserId = m.UserId,
                    Title = "Etkinlik İptal Edildi",
                    Message = $"{ev.Name} etkinliği iptal edildi. Sebep: {dto.Reason}",
                    CreatedAt = DateTime.UtcNow
                });


                await emailService.SendEmailAsync(
                    m.User.Email,
                    $"Etkinlik İptal Edildi: {ev.Name}",
                    $@"
                <h2>{ev.Club.Name} - Etkinlik İptali</h2>
                <p><b>Etkinlik:</b> {ev.Name}</p>
                <p><b>Yer:</b> {ev.Location}</p>
                <p><b>Başlangıç:</b> {ev.StartDate:dd.MM.yyyy HH:mm}</p>
                <p><b>Bitiş:</b> {ev.EndDate:dd.MM.yyyy HH:mm}</p>
                <br />
                <p><b>İptal Nedeni:</b> {dto.Reason}</p>
                <br />
                <p><i>Bu etkinlik kulüp yöneticisi tarafından iptal edilmiştir.</i></p>
            ");
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "Etkinlik iptal edildi, üyelere bildirim ve email gönderildi." });
        }



        public class CancelEventDto
        {
            public string Reason { get; set; }
        }
    }
}