using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uni2ClupProjectBackend.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Surname { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Role { get; set; } = "User";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public int? ClubId { get; set; }

        // Bölüm ID
        public int? DepartmentId { get; set; }

        // 🔥 EKSİK OLAN — %100 EKLENMESİ GEREKEN NAVIGATION
        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        public bool MustChangePassword { get; set; } = false;
        public bool ForcePasswordChange { get; set; } = false;

    }
}
