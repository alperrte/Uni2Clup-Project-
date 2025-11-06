using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using System.Security.Claims;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Herkes görebilir
        [HttpGet("list")]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var events = _context.Events
                .OrderByDescending(e => e.Id)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Capacity,
                    e.Location,
                    e.StartDate,
                    e.EndDate,
                    e.ClubName,
                    e.Description,
                    CreatedBy = e.CreatedBy // sadece bilgi olarak
                })
                .ToList();

            return Ok(events);
        }

        // 🔹 ClubManager oluşturabilir
        [HttpPost("create")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Create([FromBody] Event newEvent)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            newEvent.CreatedBy = email ?? "unknown@system";

            _context.Events.Add(newEvent);
            _context.SaveChanges();

            return Ok(new
            {
                message = "✅ Etkinlik başarıyla oluşturuldu.",
                eventData = newEvent
            });
        }

        // 🔹 ClubManager güncelleyebilir (her etkinlik için)
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Update(int id, [FromBody] Event updated)
        {
            var existing = _context.Events.FirstOrDefault(e => e.Id == id);

            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            // 🚫 Artık CreatedBy kontrolü yok
            existing.Name = updated.Name;
            existing.Location = updated.Location;
            existing.Capacity = updated.Capacity;
            existing.ClubName = updated.ClubName;
            existing.Description = updated.Description;
            existing.StartDate = updated.StartDate;
            existing.EndDate = updated.EndDate;

            _context.SaveChanges();

            return Ok(new { message = "✅ Etkinlik güncellendi.", updated });
        }

        // 🔹 ClubManager silebilir (her etkinlik için)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Delete(int id)
        {
            var existing = _context.Events.FirstOrDefault(e => e.Id == id);

            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            // 🚫 Artık CreatedBy kontrolü yok
            _context.Events.Remove(existing);
            _context.SaveChanges();

            return Ok(new { message = "🗑️ Etkinlik silindi." });
        }
    }
}
