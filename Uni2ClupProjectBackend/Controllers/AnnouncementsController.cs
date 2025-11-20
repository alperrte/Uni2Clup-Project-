using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

            var ev = await _db.Events.FindAsync(dto.EventId);
            if (ev == null)
                return NotFound(new { message = "Etkinlik bulunamadı." });

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
            var announcements = await _db.Announcements
                .Include(a => a.Event)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.EventId,
                    EventName = a.Event.Name,    // ✔ DÜZELTİLEN SATIR
                    a.Message,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }
}
