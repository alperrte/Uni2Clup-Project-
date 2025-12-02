using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using Uni2ClupProjectBackend.Services;
using Uni2ClupProjectBackend.DTOs;


namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly EmailService _emailService;
        private readonly UserService _userService;

        public AdminController(AppDbContext db, EmailService emailService, UserService userService)
        {
            _db = db;
            _emailService = emailService;
            _userService = userService;
        }



        // KULLANICI SİLME
        [HttpDelete("delete-user/{id}")]
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


        // BAŞVURULARI LİSTELE
        [HttpGet("student-applications")]
        [Authorize(Roles = "Admin")]
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


        // BAŞVURU ONAYLAMA
        [HttpPost("approve-student/{id}")]
        [Authorize(Roles = "Admin")]
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
Öğrencilik başvurunuz onaylanmıştır.<br><br>
<strong>Geçici Şifreniz:</strong> {tempPassword}<br><br>
Lütfen ilk girişte şifrenizi değiştiriniz.<br><br>
<strong>Uni2Clup</strong>
");

            return Ok(new { message = "Başvuru onaylandı ve kullanıcı oluşturuldu." });
        }


        // BAŞVURU REDDETME
        [HttpPost("reject-student/{id}")]
        [Authorize(Roles = "Admin")]
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
                "Uni2Clup - Öğrencilik Başvurunuz Reddedildi",
        $@"
Sayın {application.Name} {application.Surname},<br><br>
Öğrencilik başvurunuz maalesef reddedilmiştir.<br><br>
Detaylı bilgi için yönetim ile iletişime geçebilirsiniz.<br><br>
<strong>Uni2Clup</strong>
");

            return Ok(new { message = "Başvuru reddedildi." });
        }


        // TÜM KULLANICILARI LİSTELE
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


        // YENİ KULLANICI (YÖNETİCİ / AKADEMİSYEN) OLUŞTURMA
        [HttpPost("create-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            var result = await _userService.CreateUserAsync(dto);
            if (!result.Success)
                return BadRequest(new { message = result.Message });

            result.Created!.MustChangePassword = true;
            await _db.SaveChangesAsync();

            try
            {
                await _emailService.SendEmailAsync(
                    result.Created!.Email,
                    "Uni2Clup - Hesabınız Oluşturulmuştur",
        $@"
Sayın {result.Created!.Name} {result.Created!.Surname},<br><br>
Tarafınıza bir hesap oluşturulmuştur.<br><br>
<strong>Geçici Şifreniz:</strong> {result.PlainPassword}<br><br>
Lütfen ilk girişte şifrenizi değiştiriniz.<br><br>
<strong>Uni2Clup</strong>"
                );
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


        // KULLANICI AKTİF/PASİF YAPMA
        [HttpPut("toggle-active/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserActive(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            Club? club = null;
            if (user.Role == "ClubManager" && user.ClubId.HasValue)
                club = await _db.Clubs.FindAsync(user.ClubId);

            user.IsActive = !user.IsActive;
            await _db.SaveChangesAsync();

            string subject = "";
            string body = "";
            string clubName = club?.Name ?? "Kulübünüz";

            // ROLE GÖRE MAİL İÇERİKLERİ
            switch (user.Role)
            {
                case "Student":
                    if (!user.IsActive)
                    {
                        subject = "Uni2Clup - Öğrenci Hesabınız Askıya Alındı";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
Öğrenci hesabınız askıya alınmıştır.<br>
Bu durumla ilgili Uni2Clup yönetimi ile iletişime geçebilirsiniz.<br><br>
Saygılarımızla,<br>
<strong>Uni2Clup</strong>";
                    }
                    else
                    {
                        subject = "Uni2Clup - Öğrenci Hesabınız Aktifleştirildi";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
Öğrenci hesabınız yeniden aktifleştirilmiştir.<br>
Artık sisteme giriş yapabilirsiniz.<br><br>
Saygılarımızla,<br>
<strong>Uni2Clup</strong>";
                    }
                    break;

                case "Admin":
                case "Academic":
                    if (!user.IsActive)
                    {
                        subject = "Uni2Clup - Hesabınız Askıya Alındı";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
Hesabınız askıya alınmıştır.<br>
Detaylı bilgi için yönetimle iletişime geçebilirsiniz.<br><br>
Saygılarımızla,<br>
<strong>Uni2Clup</strong>";
                    }
                    else
                    {
                        subject = "Uni2Clup - Hesabınız Aktifleştirildi";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
Hesabınız yeniden aktifleştirilmiştir.<br>
Tüm yetkilerinizi tekrar kullanabilirsiniz.<br><br>
Saygılarımızla,<br>
<strong>Uni2Clup</strong>";
                    }
                    break;

                case "ClubManager":
                    if (!user.IsActive)
                    {
                        subject = "Uni2Clup - Kulüp Yöneticiliğiniz Askıya Alındı";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
<strong>{clubName}</strong> kulübüne ait yöneticilik yetkileriniz askıya alınmıştır.<br><br>
Saygılarımızla,<br>
<strong>Uni2Clup</strong>";
                    }
                    else
                    {
                        subject = "Uni2Clup - Kulüp Yöneticiliğiniz Aktifleştirildi";
                        body = $@"
Sayın {user.Name} {user.Surname},<br><br>
<strong>{clubName}</strong> kulübüne ait yöneticilik yetkileriniz yeniden aktifleştirilmiştir.<br><br>
Başarılar dileriz,<br>
<strong>Uni2Clup</strong>";
                    }
                    break;
            }

            await _emailService.SendEmailAsync(user.Email, subject, body);

            return Ok(new
            {
                message = user.IsActive ? "Kullanıcı aktif edildi." : "Kullanıcı pasif edildi.",
                isActive = user.IsActive
            });
        }


        // KULÜP YÖNETİCİSİ ATAMA 
        [HttpPut("assign-manager/{userId}")]
        public async Task<IActionResult> AssignClubManager(int userId, [FromBody] AssignClubManagerDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            var club = await _db.Clubs.FindAsync(dto.ClubId);
            if (club == null)
                return BadRequest(new { message = "❌ Kulüp bulunamadı." });

            if (!club.IsActive)
                return BadRequest(new { message = "❌ Pasif kulübe yönetici atanamaz." });

            var existingManager = await _db.Users
                .FirstOrDefaultAsync(u => u.ClubId == dto.ClubId && u.Role == "ClubManager");

            if (existingManager != null)
            {
                _db.PastClubManagers.Add(new PastClubManager
                {
                    UserId = existingManager.Id,
                    ClubName = club.Name,
                    RemovedAt = DateTime.UtcNow
                });

                existingManager.Role = "Student";
                existingManager.ClubId = null;
            }

            user.Role = "ClubManager";
            user.ClubId = club.Id;

            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                $"Uni2Clup - {club.Name} Kulübü Yönetici Atamanız",
$@"
Sayın {user.Name} {user.Surname},<br><br>

<strong>{club.Name}</strong> kulübüne <strong>Kulüp Yöneticisi</strong> olarak atanmış bulunmaktasınız.<br><br>

Kulübünüzün etkinliklerini yönetebilir, duyurular oluşturabilir ve üyeleri yönetebilirsiniz.<br><br>

Yeni görevinizde başarılar dileriz.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup</strong>
");

            return Ok(new
            {
                message = $"{user.Name} {user.Surname} artık {club.Name} kulübünün yöneticisidir.",
                user = userId,
                club = club.Id
            });
        }


        // KULÜP YÖNETİCİLİĞİNİ GERİ AL
        [HttpPut("remove-manager/{userId}")]
        public async Task<IActionResult> RemoveManager(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "❌ Kullanıcı bulunamadı." });

            if (user.Role != "ClubManager")
                return BadRequest(new { message = "Bu kullanıcı bir kulüp yöneticisi değil." });

            var club = await _db.Clubs.FindAsync(user.ClubId!.Value);

            _db.PastClubManagers.Add(new PastClubManager
            {
                UserId = user.Id,
                ClubName = club?.Name ?? "-",
                RemovedAt = DateTime.UtcNow
            });

            user.Role = "Student";
            user.ClubId = null;

            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email,
                $"Uni2Clup - {club?.Name ?? "Kulübünüz"} Yöneticiliği Kaldırıldı",
$@"
Sayın {user.Name} {user.Surname},<br><br>

<strong>{club?.Name ?? "Kulübünüz"}</strong> kulübüne ait yöneticilik yetkileriniz alınmıştır.<br><br>

Öğrenci olarak sisteme erişmeye devam edebilirsiniz. 
Daha fazla bilgi için Uni2Clup yönetimiyle lütfen iletişime geçin.<br><br>

Saygılarımızla,<br>
<strong>Uni2Clup</strong>
");

            return Ok(new { message = "Kulüp yöneticiliği başarıyla geri alındı." });
        }


        // GEÇMİŞ YÖNETİCİLER 
        [HttpGet("past-managers")]
        public async Task<IActionResult> GetPastManagers()
        {
            var list = await _db.PastClubManagers
                .OrderByDescending(x => x.RemovedAt)
                .ToListAsync();

            return Ok(list);
        }

        private string GenerateTemporaryPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

    }
}
