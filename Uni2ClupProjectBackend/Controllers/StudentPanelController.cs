using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;

[ApiController]
[Route("api/studentpanel")]
[Authorize(Roles = "Student")]
public class StudentPanelController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentPanelController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        return _db.Users.First(u => u.Email == email).Id;
    }

    private string Encode(string text)
    {
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(text));
    }

    private string Decode(string base64)
    {
        return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(base64));
    }

    [HttpGet("clubs")]
    public async Task<IActionResult> GetClubs()
    {
        int userId = GetUserId();

        var myClubs = await _db.ClubMembers
            .Where(cm => cm.UserId == userId)
            .Select(cm => cm.ClubId)
            .ToListAsync();

        var clubs = await _db.Clubs
            .Include(c => c.Department)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Description,
                departmentName = c.Department != null ? c.Department.Name : "-",
                c.DepartmentId,
                isMember = myClubs.Contains(c.Id)
            })
            .ToListAsync();

        return Ok(clubs);
    }

    
    [HttpGet("events/{eventId}/rating-status")]
    public async Task<IActionResult> RatingStatus(int eventId)
    {
        int userId = GetUserId();

        bool alreadyRated = await _db.EventRatings
            .AnyAsync(r => r.EventId == eventId && r.UserId == userId);

        return Ok(new { alreadyRated });
    }


    public class RatingDto
    {
        public int Q1 { get; set; }
        public int Q2 { get; set; }
        public int Q3 { get; set; }
        public int Q4 { get; set; }
        public int Q5 { get; set; }
    }

    [HttpPost("events/{eventId}/rate")]
    public async Task<IActionResult> RateEvent(int eventId, [FromBody] RatingDto dto)
    {
        int userId = GetUserId();

        var ev = await _db.Events.FindAsync(eventId);
        if (ev == null)
            return NotFound(new { message = "Etkinlik bulunamadı." });

        // Türkiye saati
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
        var turkeyNow = TimeZoneInfo.ConvertTime(DateTime.UtcNow, tz);

        // ❗ DB’deki tarih zaten Türkiye saati → UTC gibi davranmıyoruz
        var eventEndInTurkey = ev.EndDate;

        // DEBUG LOG
        Console.WriteLine("========== EVENT END DEBUG ==========");
        Console.WriteLine("DB EndDate (raw) : " + ev.EndDate.ToString("yyyy-MM-dd HH:mm:ss"));
        Console.WriteLine("Turkey Now       : " + turkeyNow.ToString("yyyy-MM-dd HH:mm:ss"));
        Console.WriteLine("Comparison evEnd > now = " + (eventEndInTurkey > turkeyNow));
        Console.WriteLine("======================================");

        // Etkinlik bitmeden oylama yapılamaz
        if (eventEndInTurkey > turkeyNow)
            return BadRequest(new { message = "Etkinlik bitmeden puanlama yapılamaz." });

        // Daha önce puanladı mı?
        bool alreadyRated = await _db.EventRatings
            .AnyAsync(r => r.EventId == eventId && r.UserId == userId);

        if (alreadyRated)
            return BadRequest(new { message = "Bu etkinlik için zaten puan verdiniz." });

        // Puan kaydet
        var rate = new EventRating
        {
            EventId = eventId,
            UserId = userId,
            Q1 = dto.Q1,
            Q2 = dto.Q2,
            Q3 = dto.Q3,
            Q4 = dto.Q4,
            Q5 = dto.Q5
        };

        _db.EventRatings.Add(rate);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Puanlama başarıyla kaydedildi." });
    }





    private async Task AddSurveyNotification(int eventId)
    {
        var ev = await _db.Events.Include(e => e.Club).FirstAsync(e => e.Id == eventId);

        var participants = await _db.EventParticipants
            .Where(p => p.EventId == eventId)
            .ToListAsync();

        foreach (var p in participants)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = p.UserId,
                Title = "Etkinlik Değerlendirme Anketi",
                Message = $"{ev.Name} etkinliği sona erdi. Lütfen değerlendirme anketini doldurun.",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }


    [HttpPost("clubs/{clubId}/join")]
    public async Task<IActionResult> JoinClub(int clubId)
    {
        int userId = GetUserId();

        if (await _db.ClubMembers.AnyAsync(c => c.ClubId == clubId && c.UserId == userId))
            return BadRequest(new { message = "Zaten üyesiniz." });

        var club = await _db.Clubs.FindAsync(clubId);
        if (club == null)
            return NotFound(new { message = "Kulüp bulunamadı." });

        _db.ClubMembers.Add(new ClubMember { ClubId = clubId, UserId = userId });
        await _db.SaveChangesAsync();

        // Bildirim
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = "Kulüp Üyeliği",
            Message = $"{club.Name} katılımınız gerçekleşmiştir."
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{club.Name} kulübüne katıldınız." });
    }

    [HttpPost("clubs/{clubId}/leave")]
    public async Task<IActionResult> LeaveClub(int clubId)
    {
        int userId = GetUserId();

        var entity = await _db.ClubMembers
            .FirstOrDefaultAsync(c => c.ClubId == clubId && c.UserId == userId);

        if (entity == null)
            return BadRequest(new { message = "Üye değilsiniz." });

        var club = await _db.Clubs.FindAsync(clubId);

        _db.ClubMembers.Remove(entity);
        await _db.SaveChangesAsync();

        // Bildirim ekle
        if (club != null)
        {
            _db.Notifications.Add(new Notification
            {
                UserId = userId,
                Title = "Kulüp Üyeliği",
                Message = $"{club.Name} üyeliğinden ayrıldınız."
            });

            await _db.SaveChangesAsync();
        }

        return Ok(new { message = $"{club?.Name} kulübünden ayrıldınız." });
    }


    [HttpGet("events/joined")]
    public async Task<IActionResult> JoinedEvents()
    {
        int userId = GetUserId();

        var events = await _db.EventParticipants
            .Where(ep => ep.UserId == userId)
            .Include(ep => ep.Event)
            .ThenInclude(e => e.Club)
            .Select(ep => new
            {
                ep.Event.Id,
                ep.Event.Name,
                ep.Event.Location,
                ClubName = ep.Event.Club.Name,   // ✔ DÜZELTİLDİ
                ep.Event.Capacity,
                ep.Event.Description,
                ep.Event.StartDate,
                ep.Event.EndDate,
                isCancelled = ep.Event.IsCancelled
            })
            .ToListAsync();

        return Ok(events);
    }


    [HttpGet("events/member-clubs")]
    public async Task<IActionResult> MemberClubEvents()
    {
        int userId = GetUserId();
        var now = DateTime.UtcNow;

        var clubIds = await _db.ClubMembers
            .Where(x => x.UserId == userId)
            .Select(x => x.ClubId)
            .ToListAsync();

        var events = await _db.Events
            .Where(e =>
    clubIds.Contains(e.ClubId) &&
    e.EndDate >= now &&
    !_db.EventParticipants.Any(ep => ep.EventId == e.Id && ep.UserId == userId)
)
            .Include(e => e.Club)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Location,
                e.Capacity,
                ClubName = e.Club.Name,   // ✔ kulüp adı
                e.Description,
                e.StartDate,
                e.EndDate,
                isCancelled = e.IsCancelled
            })
            .ToListAsync();

        return Ok(events);
    }




    [HttpGet("events/past")]
    public async Task<IActionResult> PastEvents()
    {
        int userId = GetUserId();
        var now = DateTime.UtcNow;

        // Kullanıcının üye olduğu kulüpler
        var clubIds = await _db.ClubMembers
            .Where(cm => cm.UserId == userId)
            .Select(cm => cm.ClubId)
            .ToListAsync();

        // Üye olunan kulüplerin TARİHİ GEÇMİŞ etkinlikleri
        var events = await _db.Events
            .Where(e => clubIds.Contains(e.ClubId) && e.EndDate < now)
            .Include(e => e.Club)
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
                isCancelled = e.IsCancelled
            })
            .ToListAsync();

        foreach (var ev in events)
        {
            bool alreadyNotified = await _db.Notifications.AnyAsync(n =>
                n.UserId == userId &&
                n.Title == "Etkinlik Değerlendirme Anketi" &&
                n.Message.Contains(ev.Name));

            bool alreadyRated = await _db.EventRatings.AnyAsync(r =>
                r.EventId == ev.Id && r.UserId == userId);

            if (!alreadyNotified && !alreadyRated)
                await AddSurveyNotification(ev.Id);
        }


        return Ok(events);
    }

    [HttpPost("events/join/{eventId}")]
    public async Task<IActionResult> JoinEvent(int eventId)
    {
        int userId = GetUserId();

        // Etkinlik var mı?
        var ev = await _db.Events.FindAsync(eventId);
        if (ev == null)
            return NotFound(new { message = "Etkinlik bulunamadı." });

        // Zaten katıldı mı?
        bool joined = await _db.EventParticipants
            .AnyAsync(ep => ep.EventId == eventId && ep.UserId == userId);

        if (joined)
            return BadRequest(new { message = "Bu etkinliğe zaten katıldınız." });

        // Katılım oluştur
        var participant = new EventParticipant
        {
            EventId = eventId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };

        _db.EventParticipants.Add(participant);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Etkinliğe başarıyla katıldınız." });
    }


    [HttpPost("events/leave/{eventId}")]
    public async Task<IActionResult> LeaveEvent(int eventId)
    {
        int userId = GetUserId();

        // Etkinliğe katılım var mı?
        var participation = await _db.EventParticipants
            .FirstOrDefaultAsync(ep => ep.EventId == eventId && ep.UserId == userId);

        if (participation == null)
            return BadRequest(new { message = "Bu etkinliğe zaten katılmamışsınız." });

        // Katılımı sil
        _db.EventParticipants.Remove(participation);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Etkinlikten başarıyla ayrıldınız." });
    }



    [HttpGet("notifications/all")]
    public async Task<IActionResult> GetAllNotifications()
    {
        int userId = GetUserId();

        var list = await _db.Notifications.Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("notifications/unread")]
    public async Task<IActionResult> GetUnread()
    {
        int userId = GetUserId();

        var list = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost("notifications/{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var notif = await _db.Notifications.FindAsync(id);
        if (notif == null) return NotFound();

        notif.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        int userId = GetUserId();

        var user = await _db.Users
            .Include(u => u.Department)
            .FirstAsync(u => u.Id == userId);

        var clubs = await _db.ClubMembers
            .Where(cm => cm.UserId == userId)
            .Include(cm => cm.Club)
            .ThenInclude(c => c.Department)
            .Select(cm => new
            {
                cm.Club.Id,
                cm.Club.Name,
                description = cm.Club.Description,
                departmentName = cm.Club.Department != null ? cm.Club.Department.Name : "-"
            })
            .ToListAsync();

        return Ok(new
        {
            user.Name,
            user.Surname,
            user.Email,
            departmentName = user.Department != null ? user.Department.Name : "-",
            clubs
        });
    }

}

