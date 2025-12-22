namespace Uni2ClupProjectBackend.DTOs
{
    public class UserCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; 
        public string Role { get; set; } = "User";        
        public int? ClubId { get; set; }                 
    }
}
