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

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly UserService _userService;

        public AuthController(AppDbContext context, IConfiguration config, UserService userService)
        {
            _context = context;
            _config = config;
            _userService = userService;
        }

        // 🔐 Login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.EnhancedVerify(request.Password, user.PasswordHash))
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
                registrationDate = result.Created.CreatedAt // ✅ yeni kullanıcı tarihini döndür
            });
        }

        // 📋 Kullanıcıları Listele (sadece Admin)
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.Select(u => new
            {
                id = u.Id,
                name = u.Name,
                surname = u.Surname,
                email = u.Email,
                role = u.Role,
                registrationDate = u.CreatedAt // ✅ frontend’e gönder
            }).ToList();

            return Ok(users);
        }

        // ❌ Kullanıcı Sil (sadece Admin)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            _context.Users.Remove(user);
            _context.SaveChanges();
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

        // 📩 Login DTO
        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}
