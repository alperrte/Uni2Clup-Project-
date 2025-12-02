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

                // ❗ PASİF kullanıcı giriş yapamasın
                if (!user.IsActive)
                {
                    return StatusCode(403, new { message = "SUSPENDED" });
                }




                // ⭐⭐ GEÇİCİ ŞİFRE KULLANANLAR BURADA YAKALANIR ⭐⭐
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
                    clubId = user.ClubId  // (ClubManager ise dolu gelir)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası.", error = ex.Message });
            }
        }

        [HttpPost("first-login-change-password")]
        public async Task<IActionResult> FirstLoginChangePassword([FromBody] FirstLoginPasswordDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            // ✔✔ DOĞRU KONTROL
            bool isTemporaryCorrect = BCrypt.Net.BCrypt.EnhancedVerify(dto.TemporaryPassword, user.PasswordHash);

            if (!isTemporaryCorrect)
                return BadRequest(new { message = "Geçici şifre hatalı." });

            // ✔ Yeni şifreyi kaydet
            user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.NewPassword);

            // 🔥 Şifre zorunluluğunu kapat
            user.MustChangePassword = false;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Şifre başarıyla güncellendi." });
        }

        // Öğrenci Silme 
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Kullanıcı başarıyla silindi." });
        }



        // 🧾 Öğrenci Başvurusu
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

            return Ok(new { message = "Başvurunuz alınmıştır. Yönetici onayı sonrası geçici şifreniz mail ile gönderilecektir." });
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
                DepartmentId = application.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = true
            };

            _db.Users.Add(user);
            application.Status = "Onaylandı";
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                application.Email,
                "Uni2Clup - Öğrencilik Başvurunuz Onaylandı",
$@"
Sayın {application.Name} {application.Surname},<br><br>

Üniversitemiz öğrenci kulüpleri ve etkinlik platformu <strong>Uni2Clup</strong> sistemine yaptığınız öğrencilik başvurusu <strong>başarıyla onaylanmıştır</strong>.<br><br>

Hesabınız oluşturulmuş olup sisteme giriş yapabilmeniz için geçici şifreniz aşağıda belirtilmiştir:<br><br>

<strong>Geçici Şifreniz:</strong> <span style='font-size:18px; font-weight:bold;'>{tempPassword}</span><br><br>

Lütfen hesabınıza giriş yaptıktan sonra şifrenizi güncelleyiniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");

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
                "Uni2Clup - Başvurunuz Hakkında",
$@"
Sayın {application.Name} {application.Surname},<br><br>

Uni2Clup sistemine yapmış olduğunuz öğrencilik başvurusu değerlendirilmiş olup <strong>maalesef uygun bulunmamıştır</strong>.<br><br>

Detaylı bilgi için ilgili birim ile iletişime geçebilirsiniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");

            return Ok(new { message = "Başvuru reddedildi." });
        }

        // 📋 Başvuruları Listele
        [HttpGet("get-applications")]
        public async Task<IActionResult> GetApplications()
        {
            var apps = await _db.StudentApplications
                .Include(a => a.Department)
                .OrderByDescending(x => x.CreatedAt)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name,
                    surname = a.Surname,
                    email = a.Email,
                    departmentId = a.DepartmentId,
                    department = a.Department != null ? a.Department.Name : "",
                    createdAt = a.CreatedAt,
                    status = a.Status
                })
                .ToListAsync();

            return Ok(apps);
        }

        // 🧩 Kullanıcı Ekle (Admin)
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto dto)
        {
            var result = await _userService.CreateUserAsync(dto);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            // ⭐ Kullanıcıya geçici şifre verildi → şifre değiştirme zorunlu
            result.Created!.MustChangePassword = true;
            await _db.SaveChangesAsync();

            try
            {
                await _emailService.SendEmailAsync(
                    result.Created!.Email,
                    "Uni2Clup - Hesabınız Oluşturuldu",
        $@"
Sayın {result.Created!.Name} {result.Created!.Surname},<br><br>

Tarafınıza Uni2Clup sisteminde kullanılmak üzere bir kullanıcı hesabı oluşturulmuştur.<br><br>

<strong>Geçici Şifreniz:</strong> 
<span style='font-size:18px; font-weight:bold;'>{result.PlainPassword}</span><br><br>

Lütfen ilk girişinizden sonra güvenliğiniz için şifrenizi değiştiriniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");
            }
            catch
            {
                return Ok(new
                {
                    message = result.Message + " (Mail gönderilemedi, şifre aşağıda)",
                    email = result.Created!.Email,
                    password = result.PlainPassword
                });
            }

            return Ok(new
            {
                message = result.Message,
                email = result.Created!.Email,
                password = result.PlainPassword
            });
        }


        // 📋 Kullanıcıları Listele
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
                registrationDate = u.CreatedAt,
                isActive = u.IsActive,
                clubId = u.ClubId,
                departmentId = u.DepartmentId,
                departmentName = u.Department != null ? u.Department.Name : "-"
            }).ToList();

            return Ok(users);
        }

        // 🔄 Aktif/Pasif Toggle
        [HttpPut("toggle-active/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserActive(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            user.IsActive = !user.IsActive;
            await _db.SaveChangesAsync();

            // 📧 Mail gönderme
            if (!user.IsActive)
            {
                // PASİF YAPILDI → YÖNETİCİLİK DONDURMA MAİLİ
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Uni2Clup - Kulüp Yöneticiliği Durum Güncellemesi",
        $@"
Sayın {user.Name} {user.Surname},<br><br>

Uni2Clup sistemindeki hesabınıza ait yöneticilik yetkileriniz <strong>pasif</strong> konuma getirilmiştir.<br><br>

Bu işlem sonucunda kulüp üzerindeki yönetici yetkileriniz geçici olarak dondurulmuştur.<br>
Gerekli durumlarda sistem yöneticileri ile iletişime geçebilirsiniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");
            }
            else
            {
                // AKTİF YAPILDI → YENİDEN AKTİFLEŞME MAİLİ
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Uni2Clup - Kulüp Yöneticiliğiniz Aktifleştirildi",
        $@"
Sayın {user.Name} {user.Surname},<br><br>

Uni2Clup sistemindeki yöneticilik yetkileriniz <strong>yeniden aktif</strong> hale getirilmiştir.<br><br>

Artık kulübünüzü yönetebilir, etkinlikler oluşturabilir ve üyeleri yönetebilirsiniz.<br><br>

Başarılar dileriz.<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");
            }

            return Ok(new
            {
                message = user.IsActive ? "Kullanıcı aktif edildi." : "Kullanıcı pasif edildi.",
                isActive = user.IsActive
            });
        }


        // 🎯 Kulüp Yöneticisi Atama
        [HttpPut("assign-club-manager/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignClubManager(int userId, [FromBody] AssignClubManagerDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            if (user.Role != "Student")
                return BadRequest(new { message = "Sadece öğrenciler atanabilir." });

            var club = await _db.Clubs.FindAsync(dto.ClubId);
            if (club == null)
                return NotFound(new { message = "❌ Kulüp bulunamadı." });

            if (!club.IsActive)
                return BadRequest(new { message = "Pasif kulübe yönetici atanamaz." });

            // 🎯 Rol ve Kulüp Atama
            user.Role = "ClubManager";
            user.ClubId = dto.ClubId;

            await _db.SaveChangesAsync();

            // 📧 Yeni EKLEDİĞİMİZ YÖNETİCİLİK BİLGİLENDİRME MAİLİ
            await _emailService.SendEmailAsync(
                user.Email,
                $"Uni2Clup - {club.Name} Kulübü Yönetici Atamanız",
        $@"
Sayın {user.Name} {user.Surname},<br><br>

Üniversitemiz öğrenci kulüpleri platformu <strong>Uni2Clup</strong> üzerinde yapılan değerlendirme sonucunda,<br>
<strong>{club.Name}</strong> kulübüne <strong>Kulüp Yöneticisi</strong> olarak atanmış bulunmaktasınız.<br><br>

Yeni görevinizde başarılar dileriz. Kulübünüzün etkinliklerini yönetebilir, duyurular oluşturabilir ve öğrenci topluluğuna katkıda bulunabilirsiniz.<br><br>

Herhangi bir sorunda sistem yöneticileri ile iletişime geçebilirsiniz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup Sistem Yönetimi</strong>
");

            return Ok(new
            {
                message = $"{user.Name} {user.Surname} artık {club.Name} kulübünün yöneticisi.",
                userId = user.Id,
                clubId = club.Id,
                clubName = club.Name
            });
        }


        // 🔐 Şifre Sıfırlama Talebi
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                // 1) Email boş mu?
                if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { message = "E-posta adresi gerekli." });

                string email = dto.Email.Trim();

                // 2) Kullanıcı var mı?
                var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);
                if (user == null)
                    return BadRequest(new { message = "Bu e-posta adresi sistemde bulunamadı." });

                // 3) Token oluştur
                string token = Guid.NewGuid().ToString("N");

                var reset = new PasswordResetToken
                {
                    Email = email,
                    Token = token,
                    ExpireAt = DateTime.UtcNow.AddMinutes(15)
                };

                _db.PasswordResetTokens.Add(reset);
                await _db.SaveChangesAsync();

                // Reset link
                string link = $"http://localhost:3000/reset-password/{token}";

                // 4) E-posta gönder
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
    <strong>Uni2Clup Sistem Yönetimi</strong>
</div>
";

                await _emailService.SendEmailAsync(
                    email,
                    "Uni2Clup - Şifre Sıfırlama Talebi",
                    html
                );

                return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
            }
            catch (Exception ex)
            {
                // Eğer MailKit veya başka bir hata olursa yine 500 YEMEZ
                return StatusCode(500, new { message = "Sunucu hatası oluştu.", error = ex.Message });
            }
        }



        // 🔐 Şifre Sıfırlama
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

                // Şifreyi güncelle
                user.PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.NewPassword);
                user.MustChangePassword = false;

                // Token'i sil
                _db.PasswordResetTokens.Remove(record);

                await _db.SaveChangesAsync();

                return Ok(new { message = "Şifre başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası.", error = ex.Message });
            }
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

    } // END AuthController CLASS

} // END NAMESPACE

// DTO'lar
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AssignClubManagerDto
{
    public int ClubId { get; set; }
}
