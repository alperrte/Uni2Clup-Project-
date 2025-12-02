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


        // Giriş
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

                if (!user.IsActive)
                {
                    return StatusCode(403, new { message = "SUSPENDED" });
                }

                if (user.MustChangePassword)
                {
                    return Ok(new
                    {
                        forcePasswordChange = true,
                        email = user.Email
                    });
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "✅ Giriş başarılı.",
                    id = user.Id,
                    name = user.Name,
                    surname = user.Surname,
                    role = user.Role,
                    email = user.Email,
                    token = token,
                    clubId = user.ClubId  
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası.", error = ex.Message });
            }
        }

        // İlk Girişte Şifre Değiştirme
        [HttpPost("first-login-change-password")]
        public async Task<IActionResult> FirstLoginChangePassword([FromBody] FirstLoginPasswordDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            bool isTemporaryCorrect = BCrypt.Net.BCrypt.EnhancedVerify(dto.TemporaryPassword, user.PasswordHash);

            if (!isTemporaryCorrect)
                return BadRequest(new { message = "Geçici şifre hatalı." });

            user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.NewPassword);

            user.MustChangePassword = false;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Şifre başarıyla güncellendi." });
        }

        // Öğrenci Başvurusu
        [HttpPost("student-apply")]
        public async Task<IActionResult> StudentApply([FromBody] StudentApplicationCreateDto dto)
        {
            if (!dto.Email.EndsWith("@dogus.edu.tr"))
                return BadRequest(new { message = "Lütfen @dogus.edu.tr uzantılı bir e-posta kullanın." });

            var existing = await _db.StudentApplications.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (existing != null)
                return BadRequest(new { message = "Bu e-posta ile daha önce başvuru yapılmış." });

            var department = await _db.Departments.FindAsync(dto.DepartmentId);
            if (department == null)
                return BadRequest(new { message = "❌ Geçersiz bölüm seçimi." });

            var application = new StudentApplication
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Email = dto.Email,
                DepartmentId = dto.DepartmentId,
                Status = "Beklemede",
                CreatedAt = DateTime.UtcNow
            };

            _db.StudentApplications.Add(application);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Başvurunuz alınmıştır. Yönetici onayı sonrası geçici şifreniz mail ile gönderilecektir. " +
                "Bu şifreyle sisteme giriş yapıp kendi şifrenizi oluşturabilirsiniz." });
        }

        // Şifre Sıfırlama Talebi
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                
                if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { message = "E-posta adresi gerekli." });

                string email = dto.Email.Trim();

                var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);
                if (user == null)
                    return BadRequest(new { message = "Bu e-posta adresi sistemde bulunamadı." });

                string token = Guid.NewGuid().ToString("N");

                var reset = new PasswordResetToken
                {
                    Email = email,
                    Token = token,
                    ExpireAt = DateTime.UtcNow.AddMinutes(15)
                };

                _db.PasswordResetTokens.Add(reset);
                await _db.SaveChangesAsync();

                string link = $"http://localhost:3000/reset-password/{token}";

                string html = $@"
<div style='font-family: Arial; font-size: 15px;'>
    Sayın <strong>{user.Name} {user.Surname}</strong>,<br><br>

    Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayınız:<br><br>

    <a href='{link}' 
       style='font-size:18px; font-weight:bold; color:#1e3a8a;'>
       🔐 Şifremi Sıfırla
    </a><br><br>

    Bu bağlantı <strong>15 dakika</strong> boyunca geçerlidir.<br><br>

    Saygılarımızla,<br>
    <strong>Uni2Clup</strong>
</div>
";

                await _emailService.SendEmailAsync(
                    email,
                    "Uni2Clup - Şifre Sıfırlama Talebi",
                    html
                );

                return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderilmiştir." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası oluştu.", error = ex.Message });
            }
        }

        // Şifre Sıfırlama
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NewPassword))
                    return BadRequest(new { message = "Eksik bilgi gönderildi." });

                var record = await _db.PasswordResetTokens
                    .FirstOrDefaultAsync(x => x.Token == dto.Token);

                if (record == null)
                    return BadRequest(new { message = "Token bulunamadı." });

                if (record.ExpireAt < DateTime.UtcNow)
                    return BadRequest(new { message = "Token süresi dolmuş." });

                var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == record.Email);
                if (user == null)
                    return BadRequest(new { message = "Kullanıcı bulunamadı." });

                user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.NewPassword);
                user.MustChangePassword = false;

                _db.PasswordResetTokens.Remove(record);

                await _db.SaveChangesAsync();

                return Ok(new { message = "Şifre başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası.", error = ex.Message });
            }
        }

        // Token Üretimi
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

        // Geçici Şifre Üretimi
        private string GenerateTemporaryPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

    } 

} 

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AssignClubManagerDto
{
    public int ClubId { get; set; }
}
