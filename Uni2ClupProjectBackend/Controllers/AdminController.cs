using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        // ⭐⭐ KULÜP YÖNETİCİLİĞİNİ GERİ AL ⭐⭐
        [HttpPut("remove-manager/{userId}")]
        public async Task<IActionResult> RemoveManager(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            if (user.Role != "ClubManager")
                return BadRequest(new { message = "Bu kullanıcı kulüp yöneticisi değil." });

            // Kullanıcının yönettiği kulüp
            var club = await _db.Clubs.FirstOrDefaultAsync(c => c.Id == user.ClubId);

            // ⭐ Geçmiş yöneticiler tablosuna kayıt ekle
            _db.PastClubManagers.Add(new PastClubManager
            {
                UserId = user.Id,
                ClubName = club?.Name ?? "-",
                RemovedAt = DateTime.UtcNow
            });

            // ⭐ Kullanıcının yöneticiliğini kaldır
            user.Role = "Student";
            user.ClubId = null;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Kulüp yöneticiliği başarıyla geri alındı." });
        }

        // ⭐ GEÇMİŞ KULÜP YÖNETİCİLERİ LİSTESİ
        [HttpGet("past-managers")]
        public async Task<IActionResult> PastManagers()
        {
            var list = await _db.PastClubManagers
                .OrderByDescending(p => p.RemovedAt)
                .ToListAsync();

            return Ok(list);
        }
    }
}
