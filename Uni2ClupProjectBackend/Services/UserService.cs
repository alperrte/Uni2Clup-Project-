using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.DTOs;
using Uni2ClupProjectBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace Uni2ClupProjectBackend.Services
{
    public class UserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(bool Success, string Message, User? Created, string PlainPassword)>
            CreateUserAsync(UserCreateDto dto)
        {
            // 1️⃣ Email boş mu?
            if (string.IsNullOrWhiteSpace(dto.Email))
                return (false, "❌ E-posta adresi gerekli.", null, "");

            // 2️⃣ Email doğuş mu?
            if (!dto.Email.EndsWith("@dogus.edu.tr"))
                return (false, "❌ E-posta @dogus.edu.tr uzantılı olmalıdır.", null, "");

            // 3️⃣ Aynı email mevcut mu?
            bool exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return (false, "❌ Bu e-posta zaten kayıtlı.", null, "");

            // 3.5️⃣ Kulüp Yöneticisi için kulüp kontrolü
            if (dto.Role == "ClubManager")
            {
                if (!dto.ClubId.HasValue)
                    return (false, "❌ Kulüp Yöneticisi için kulüp seçimi zorunludur.", null, "");

                bool clubExists = await _db.Clubs.AnyAsync(c => c.Id == dto.ClubId.Value);
                if (!clubExists)
                    return (false, "❌ Seçilen kulüp bulunamadı.", null, "");
            }

            // 4️⃣ 10 haneli otomatik şifre üret
            string plainPassword = GenerateRandomPassword(10);

            // 5️⃣ Hashle
            string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(plainPassword);

            // 6️⃣ Yeni kullanıcı oluştur
            var user = new User
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role,
                ClubId = dto.ClubId,
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // password mail gönderilmek için dönüyor
            return (true, "Kullanıcı oluşturuldu.", user, plainPassword);
        }

        // ✔ 10 haneli rastgele şifre üretici
        private static string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            Random rnd = new Random();
            return new string(Enumerable.Range(0, length).Select(_ => chars[rnd.Next(chars.Length)]).ToArray());
        }
    }
}
