using System.ComponentModel.DataAnnotations;

namespace Uni2ClupProjectBackend.Models
{
    public class EventRating
    {
        [Key]
        public int Id { get; set; }

        public int EventId { get; set; }
        public Event Event { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        // ⭐ 5 Soruluk Puanlama (1 – 3 – 5)
        public int Q1 { get; set; }
        public int Q2 { get; set; }
        public int Q3 { get; set; }
        public int Q4 { get; set; }
        public int Q5 { get; set; }

        // Puanlama tarihi
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
    }
}
