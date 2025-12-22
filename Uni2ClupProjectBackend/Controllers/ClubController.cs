using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using Uni2ClupProjectBackend.Services;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClubController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly EmailService _emailService;

        public ClubController(AppDbContext db, EmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }

        // Kulüp Üyelerini Getir
        [HttpGet("{clubId}/members")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetClubMembers(int clubId)
        {
            var club = await _db.Clubs.FindAsync(clubId);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            var members = await _db.ClubMembers
                .Where(cm => cm.ClubId == clubId)
                .Include(cm => cm.User)
                .Select(cm => new
                {
                    id = cm.User.Id,
                    name = cm.User.Name,
                    surname = cm.User.Surname,
                    email = cm.User.Email,
                    createdAt = cm.JoinedAt,
                    isActive = cm.User.IsActive
                })
                .ToListAsync();

            return Ok(members);
        }

        //  Üyeyi Kulüpten Çıkar
        [HttpPost("members/remove/{userId}")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> RemoveMember(int userId, [FromBody] RemoveMemberDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "Çıkarma nedeni zorunludur." });

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "Oturum bulunamadı." });

            var manager = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (manager == null || manager.ClubId == null)
                return Unauthorized(new { message = "Kulüp yöneticisi değilsiniz." });

            var relation = await _db.ClubMembers
                .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ClubId == manager.ClubId.Value);

            if (relation == null)
                return BadRequest(new { message = "Bu kullanıcı kulübünüzde üye değil." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            var club = await _db.Clubs.FirstOrDefaultAsync(c => c.Id == manager.ClubId);

            // Üyeliği siliyoruz
            _db.ClubMembers.Remove(relation);

            // Bildirim oluştur
            _db.Notifications.Add(new Notification
            {
                UserId = userId,
                Title = "Kulüpten Çıkarıldınız",
                Message = $"Kulüpten çıkarıldınız. Nedeni: {dto.Reason}",
                CreatedAt = DateTime.UtcNow
            });

            await _emailService.SendEmailAsync(
                user.Email,
                $"{club.Name} Kulübünden Çıkarıldınız",
        $@"
Sayın {user.Name} {user.Surname},<br><br>

<strong>{club.Name}</strong> kulübünden çıkarılmış bulunmaktasınız.<br><br>

<strong>Çıkarılma Nedeni:</strong> {dto.Reason}<br><br>

Bu işlem kulüp yöneticiniz tarafından gerçekleştirilmiştir.<br><br>

Daha fazla bilgi almak isterseniz kulüp yönetimiyle iletişime geçebilirsiniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup</strong>
");

            await _db.SaveChangesAsync();

            return Ok(new { message = "Üye kulüpten çıkarıldı, bildirim ve mail gönderildi." });
        }


        public class RemoveMemberDto
        {
            public string Reason { get; set; }
        }

        // Giriş yapan kulüp yöneticisinin kulübünü getir
        [HttpGet("my-club")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> GetMyClubAsync()
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Unauthorized(new { message = "❌ Kullanıcı bulunamadı." });

            if (user.ClubId == null)
                return NotFound(new { message = "Henüz bir kulübe bağlı değilsiniz." });

            var club = await _db.Clubs
                .Include(c => c.Department)
                .FirstOrDefaultAsync(c => c.Id == user.ClubId.Value);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            return Ok(new
            {
                id = club.Id,
                name = club.Name,
                description = club.Description,
                departmentId = club.DepartmentId,
                departmentName = club.Department?.Name ?? ""
            });
        }

        // Kulüp yöneticisi açıklama güncelle
        [HttpPut("update-description")]
        [Authorize(Roles = "ClubManager")]
        public async Task<IActionResult> UpdateMyClubDescription([FromBody] ClubDescriptionUpdateDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (email == null)
                return Unauthorized(new { message = "❌ Oturum bulunamadı." });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Unauthorized(new { message = "❌ Kullanıcı bulunamadı." });

            if (user.ClubId == null)
                return BadRequest(new { message = "Herhangi bir kulübe bağlı görünmüyorsunuz." });

            var club = await _db.Clubs.FindAsync(user.ClubId.Value);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            club.Description = dto.Description?.Trim() ?? "";

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Kulüp açıklaması güncellendi.",
                description = club.Description
            });
        }

        // Tüm kulüpleri listele
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllClubs()
        {
            var clubs = await _db.Clubs
                .Include(c => c.Department)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    id = c.Id,
                    name = c.Name,
                    departmentId = c.DepartmentId,
                    departmentName = c.Department != null ? c.Department.Name : "",
                    description = c.Description,
                    isActive = c.IsActive,
                    createdAt = c.CreatedAt,
                    closedAt = c.ClosedAt
                })
                .ToListAsync();

            return Ok(clubs);
        }

        //  Yeni kulüp oluştur
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateClub([FromBody] ClubCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "❌ Kulüp adı gereklidir." });

            if (dto.DepartmentId <= 0)
                return BadRequest(new { message = "❌ Bölüm seçimi gereklidir." });

            var department = await _db.Departments.FindAsync(dto.DepartmentId);
            if (department == null)
                return NotFound(new { message = "❌ Bölüm bulunamadı." });

            var club = new Club
            {
                Name = dto.Name.Trim(),
                DepartmentId = dto.DepartmentId,
                Description = dto.Description?.Trim() ?? "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Clubs.Add(club);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Kulüp başarıyla oluşturuldu.",
                id = club.Id,
                name = club.Name,
                departmentId = club.DepartmentId,
                departmentName = department.Name,
                description = club.Description,
                isActive = club.IsActive,
                createdAt = club.CreatedAt
            });
        }

        // Kulüp güncelle
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClub(int id, [FromBody] ClubUpdateDto dto)
        {
            var club = await _db.Clubs.FindAsync(id);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "❌ Kulüp adı gereklidir." });

            if (dto.DepartmentId <= 0)
                return BadRequest(new { message = "❌ Bölüm seçimi gereklidir." });

            var department = await _db.Departments.FindAsync(dto.DepartmentId);
            if (department == null)
                return NotFound(new { message = "❌ Bölüm bulunamadı." });

            club.Name = dto.Name.Trim();
            club.DepartmentId = dto.DepartmentId;
            club.Description = dto.Description?.Trim() ?? "";

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "✅ Kulüp başarıyla güncellendi.",
                id = club.Id,
                name = club.Name,
                departmentId = club.DepartmentId,
                departmentName = department.Name,
                description = club.Description,
                isActive = club.IsActive,
                createdAt = club.CreatedAt,
                closedAt = club.ClosedAt
            });
        }


        [HttpPut("toggle-active/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleClubActive(int id)
        {
            var club = await _db.Clubs.FindAsync(id);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            club.IsActive = !club.IsActive;

            if (club.IsActive)
                club.ClosedAt = null;
            else
                club.ClosedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = club.IsActive ? "Kulüp aktifleştirildi." : "Kulüp pasif hale getirildi.",
                isActive = club.IsActive,
                closedAt = club.ClosedAt
            });
        }


        //  Kulüp sil
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClub(int id)
        {
            var club = await _db.Clubs.FindAsync(id);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            _db.Clubs.Remove(club);
            await _db.SaveChangesAsync();

            return Ok(new { message = "🗑️ Kulüp başarıyla silindi." });
        }
    }



    // DTOs
    public class ClubCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string? Description { get; set; }
    }

    public class ClubUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string? Description { get; set; }
    }

    public class ClubDescriptionUpdateDto
    {
        public string? Description { get; set; }
    }
}
