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
            Message = $"{club.Name} kulübüne katıldınız."
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
                Message = $"{club.Name} kulübünden ayrıldınız."
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
                ep.Event.EndDate
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
            .Where(e => clubIds.Contains(e.ClubId) && e.EndDate >= now)   // ✔ sadece güncel etkinlikler
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
                e.EndDate
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
                e.EndDate
            })
            .ToListAsync();

        return Ok(events);
    }




    [HttpPost("events/{eventId}/join")]
    public async Task<IActionResult> JoinEvent(int eventId)
    {
        int userId = GetUserId();

        if (await _db.EventParticipants.AnyAsync(e => e.EventId == eventId && e.UserId == userId))
            return BadRequest(new { message = "Zaten katıldınız." });

        _db.EventParticipants.Add(new EventParticipant { EventId = eventId, UserId = userId });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Etkinliğe katıldınız." });
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

