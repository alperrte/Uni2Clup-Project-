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
                .ToList();
            return Ok(events);
        }

        // 🔹 Sadece ClubManager oluşturabilir
        [HttpPost("create")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Create([FromBody] Event newEvent)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Token geçersiz." });

            newEvent.CreatedBy = email;
            _context.Events.Add(newEvent);
            _context.SaveChanges();

            return Ok(new { message = "✅ Etkinlik başarıyla oluşturuldu.", eventData = newEvent });
        }

        // 🔹 Sadece kendi etkinliğini güncelleyebilir
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Update(int id, [FromBody] Event updated)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var existing = _context.Events.FirstOrDefault(e => e.Id == id);

            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            if (existing.CreatedBy != email)
                return Forbid("Bu etkinliği düzenleme izniniz yok.");

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

        // 🔹 Sadece kendi etkinliğini silebilir
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ClubManager")]
        public IActionResult Delete(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var existing = _context.Events.FirstOrDefault(e => e.Id == id);

            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            if (existing.CreatedBy != email)
                return Forbid("Bu etkinliği silme izniniz yok.");

            _context.Events.Remove(existing);
            _context.SaveChanges();

            return Ok(new { message = "🗑️ Etkinlik silindi." });
        }
    }
}
