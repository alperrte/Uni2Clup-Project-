using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.DTOs;
using Uni2ClupProjectBackend.Models;
using Uni2ClupProjectBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly UserService _userService;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext db, IConfiguration config, UserService userService, EmailService emailService)
        {
            _db = db;
            _config = config;
            _userService = userService;
            _emailService = emailService;
        }

        // 🔐 Login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = _db.Users.FirstOrDefault(u => u.Email == request.Email);
                if (user == null)
                    return Unauthorized(new { message = "❌ Kullanıcı bulunamadı." });

                bool isPasswordValid = BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash);
                if (!isPasswordValid)
                    return Unauthorized(new { message = "❌ Hatalı e-posta veya şifre." });

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "✅ Giriş başarılı.",
                    id = user.Id,
                    name = user.Name,
                    surname = user.Surname,
                    role = user.Role,
                    email = user.Email,
                    token = token
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası.", error = ex.Message });
            }
        }

        // 🧾 Öğrenci Başvuru
        [HttpPost("student-apply")]
        public async Task<IActionResult> StudentApply([FromBody] StudentApplicationCreateDto dto)
        {
            if (!dto.Email.EndsWith("@dogus.edu.tr"))
                return BadRequest(new { message = "Lütfen @dogus.edu.tr uzantılı bir e-posta kullanın." });

            var existing = await _db.StudentApplications
                .FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (existing != null)
                return BadRequest(new { message = "Bu e-posta ile daha önce başvuru yapılmış." });

            var application = new StudentApplication
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Email = dto.Email,
                Department = dto.Department,
                Status = "Beklemede",
                CreatedAt = DateTime.UtcNow
            };

            _db.StudentApplications.Add(application);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Başvurunuz alınmıştır. Admin onayı sonrası mail gönderilecektir." });
        }

        // ✅ Onaylama
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveStudent(int id)
        {
            var application = await _db.StudentApplications.FindAsync(id);
            if (application == null)
                return NotFound(new { message = "Başvuru bulunamadı." });

            if (application.Status == "Onaylandı")
                return BadRequest(new { message = "Bu başvuru zaten onaylanmış." });

            string tempPassword = GenerateTemporaryPassword(8);
            string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(tempPassword);

            var user = new User
            {
                Name = application.Name,
                Surname = application.Surname,
                Email = application.Email,
                PasswordHash = passwordHash,
                Role = "Student",
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            application.Status = "Onaylandı";
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                application.Email,
                "Üyeliğiniz Onaylandı",
                $"Merhaba {application.Name},\n\nKaydınız başarıyla oluşturulmuştur.\nGeçici şifreniz: {tempPassword}\n\nLütfen giriş yaptıktan sonra şifrenizi değiştiriniz.\n\nUni2Clup"
            );

            return Ok(new { message = "Başvuru onaylandı ve kullanıcı oluşturuldu." });
        }

        // ❌ Reddetme
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectStudent(int id)
        {
            var application = await _db.StudentApplications.FindAsync(id);
            if (application == null)
                return NotFound(new { message = "Başvuru bulunamadı." });

            if (application.Status == "Reddedildi")
                return BadRequest(new { message = "Bu başvuru zaten reddedilmiş." });

            application.Status = "Reddedildi";
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                application.Email,
                "Üyeliğiniz Reddedildi",
                $"Merhaba {application.Name},\n\nÜyelik başvurunuz değerlendirilmiş ve maalesef reddedilmiştir.\n\nİyi günler dileriz.\nUni2Clup"
            );

            return Ok(new { message = "Başvuru reddedildi." });
        }

        // 📋 Başvuruları Listele
        [HttpGet("get-applications")]
        public async Task<IActionResult> GetApplications()
        {
            var apps = await _db.StudentApplications
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
            return Ok(apps);
        }

        // 🧩 Kullanıcı Ekle (sadece Admin)
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto dto)
        {
            var result = await _userService.CreateUserAsync(dto);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = result.Message,
                email = result.Created!.Email,
                role = result.Created.Role,
                registrationDate = result.Created.CreatedAt
            });
        }

        // 📋 Kullanıcıları Listele (sadece Admin)
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllUsers()
        {
            var users = _db.Users.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                surname = u.Surname,
                email = u.Email,
                role = u.Role,
                registrationDate = u.CreatedAt
            }).ToList();

            return Ok(users);
        }

        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            await _emailService.SendEmailAsync(
                "202303011110@dogus.edu.tr",
                "Test Mail",
                "Bu bir test mailidir — Uni2Clup sistemi üzerinden gönderildi."
            );
            return Ok("Mail gönderildi.");
        }


        // 🗑️ Kullanıcı Sil
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteUser(int id)
        {
            var user = _db.Users.Find(id);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            _db.Users.Remove(user);
            _db.SaveChanges();
            return Ok(new { message = "🗑️ Kullanıcı silindi." });
        }

        // 🔑 Token Üretimi
        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt__Key"] ?? "qwertyuiopasdfghjklzxcvbnm123456");
            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt__Issuer"] ?? "Uni2ClupApp",
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // 🔐 Geçici Şifre Üretimi
        private string GenerateTemporaryPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // 📩 Login DTO
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
