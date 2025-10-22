using Microsoft.AspNetCore.Mvc;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string PasswordHash { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        [Consumes("application/json")]
        public IActionResult Register([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest(new { message = "❌ Bu e-posta zaten kayıtlı." });

            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(new { message = "✅ Kullanıcı eklendi." });
        }

        [HttpPost("login")]
        [Consumes("application/json")]
        public IActionResult Login([FromBody] LoginRequest loginUser)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Email == loginUser.Email && u.PasswordHash == loginUser.PasswordHash);

            if (user == null)
                return BadRequest(new { message = "❌ E-posta veya şifre hatalı." });

            return Ok(new
            {
                message = "✅ Giriş başarılı.",
                user.Id,
                user.Name,
                user.Surname,
                user.Role
            });
        }

        [HttpGet("users")]
        public IActionResult GetUsers() => Ok(_context.Users.ToList());
    }
}
