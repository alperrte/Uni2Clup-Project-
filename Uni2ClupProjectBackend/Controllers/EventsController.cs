using Microsoft.AspNetCore.Mvc;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // 🟢 Listele
        [HttpGet("list")]
        public IActionResult GetAll()
        {
            var eventsList = _context.Events
                .OrderByDescending(e => e.Id)
                .ToList();
            return Ok(eventsList);
        }

        // 🟢 Oluştur
        [HttpPost("create")]
        [Consumes("application/json")]
        public IActionResult Create([FromBody] Event newEvent)
        {
            if (newEvent == null)
                return BadRequest(new { message = "Etkinlik bilgisi boş olamaz." });

            if (newEvent.StartDate == default || newEvent.EndDate == default)
                return BadRequest(new { message = "Tarih formatı hatalı!" });

            _context.Events.Add(newEvent);
            _context.SaveChanges();

            return Ok(new { message = "✅ Etkinlik başarıyla eklendi.", eventData = newEvent });
        }

        // 🟡 Güncelle
        [HttpPut("update/{id}")]
        [Consumes("application/json")]
        public IActionResult Update(int id, [FromBody] Event updated)
        {
            var existing = _context.Events.Find(id);
            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            existing.Name = updated.Name;
            existing.Capacity = updated.Capacity;
            existing.Location = updated.Location;
            existing.ClubName = updated.ClubName;
            existing.StartDate = updated.StartDate;
            existing.EndDate = updated.EndDate;
            existing.Description = updated.Description;

            _context.SaveChanges();

            return Ok(new { message = "✅ Etkinlik başarıyla güncellendi.", updatedEvent = existing });
        }

        // 🔴 Sil
        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var existing = _context.Events.Find(id);
            if (existing == null)
                return NotFound(new { message = "❌ Etkinlik bulunamadı." });

            _context.Events.Remove(existing);
            _context.SaveChanges();

            return Ok(new { message = "🗑️ Etkinlik başarıyla silindi." });
        }
    }
}
