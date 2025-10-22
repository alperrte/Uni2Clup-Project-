using Microsoft.AspNetCore.Mvc;
using Uni2ClupBackend.Models;
using Uni2ClupProjectBackend.Data;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok("Kullanıcı başarıyla eklendi.");
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Ok(_context.Users.ToList());
        }
    }
}
