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

        public async Task<(bool Success, string Message, User? Created)> CreateUserAsync(UserCreateDto dto)
        {
            // 1️⃣ 12 haneli rastgele numara oluştur
            string studentNumber = GenerateStudentNumber(12);
            string email = $"{studentNumber}@dogus.edu.tr";

            // 2️⃣ Aynı email zaten kayıtlı mı?
            bool exists = await _db.Users.AnyAsync(u => u.Email == email);
            if (exists)
                return (false, "❌ Bu e-posta zaten kayıtlı.", null);

            // 3️⃣ Şifreyi hashle
            string passwordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.Password);

            // 4️⃣ Yeni kullanıcıyı oluştur
            var user = new User
            {
                Name = dto.Name,
                Surname = dto.Surname,
                Email = email,
                PasswordHash = passwordHash,
                Role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return (true, "✅ Kullanıcı başarıyla oluşturuldu.", user);
        }

        // 🔹 12 haneli sayı üretici
        private static string GenerateStudentNumber(int length)
        {
            var random = new Random();
            return string.Concat(Enumerable.Range(0, length).Select(_ => random.Next(0, 10).ToString()));
        }
    }
}
