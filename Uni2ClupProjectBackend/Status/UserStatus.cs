using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Uni2ClupProjectBackend.Data;

namespace Uni2ClupProjectBackend.Status
{
    public class UserStatusMiddleware
    {
        private readonly RequestDelegate _next;

        public UserStatusMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext db)
        {
            // ❗ Token yok → Geçir
            if (!context.User.Identity.IsAuthenticated)
            {
                await _next(context);
                return;
            }

            // ❗ Kullanıcı email claim çek
            var email = context.User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (email == null)
            {
                await _next(context);
                return;
            }

            // ❗ Kullanıcının DB kayıt durumu
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                await _next(context);
                return;
            }

            // ❌ Kullanıcı pasifse → direkt engelle
            if (!user.IsActive)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("SUSPENDED");
                return;
            }

            await _next(context);
        }
    }
}
