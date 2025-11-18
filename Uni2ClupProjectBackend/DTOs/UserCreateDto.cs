namespace Uni2ClupProjectBackend.DTOs
{
    public class UserCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; // ✔ email eklendi
        public string Role { get; set; } = "User";        // ✔ password kaldırıldı
        public int? ClubId { get; set; }                  // ✔ Kulüp Yöneticisi için kulüp ID
    }
}
