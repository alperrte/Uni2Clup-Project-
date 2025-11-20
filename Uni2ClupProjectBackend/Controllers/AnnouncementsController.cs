using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.DTOs;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AnnouncementsController(AppDbContext db)
        {
            _db = db;
        }

        // ⭐ DUYURU OLUŞTUR ⭐
        [HttpPost("create")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> Create([FromBody] AnnouncementCreateDto dto)
        {
            if (dto == null || dto.EventId <= 0 || string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest(new { message = "Boş alan bırakmayınız." });

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var ev = await _db.Events.FirstOrDefaultAsync(e => e.Id == dto.EventId && e.CreatedBy == email);
            if (ev == null)
                return NotFound(new { message = "Etkinlik bulunamadı veya bu etkinlik için duyuru oluşturamazsınız." });

            var announcement = new Announcement
            {
                EventId = dto.EventId,
                Message = dto.Message.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _db.Announcements.Add(announcement);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Duyuru başarıyla oluşturuldu." });
        }

        // ⭐ DUYURULARI LİSTELE ⭐
        [HttpGet("list")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> List()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            string? clubName = null;
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user?.ClubId != null)
            {
                clubName = await _db.Clubs
                    .Where(c => c.Id == user.ClubId.Value)
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();
            }

            var query = _db.Announcements
                .Include(a => a.Event)
                .AsQueryable();

            if (!string.IsNullOrEmpty(clubName))
            {
                query = query.Where(a => a.Event.ClubName == clubName);
            }
            else
            {
                query = query.Where(a => a.Event.CreatedBy == email);
            }

            var announcements = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.EventId,
                    EventName = a.Event.Name,
                    a.Message,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }
}
