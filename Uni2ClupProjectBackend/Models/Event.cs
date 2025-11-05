using System.ComponentModel.DataAnnotations;

namespace Uni2ClupProjectBackend.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public int Capacity { get; set; }
        public string ClubName { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // 🔹 Etkinliği oluşturan kullanıcının email'i
        public string CreatedBy { get; set; } = "";
    }
}
