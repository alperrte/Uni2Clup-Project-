using System;

namespace Uni2ClupProjectBackend.Models
{
    public class Announcement
    {
        public int Id { get; set; }

        // Etkinliğe ait ID
        public int EventId { get; set; }

        // Navigation property
        public Event Event { get; set; }

        // Duyurunun metni
        public string Message { get; set; } = string.Empty;

        // Oluşturulma tarihi (UTC)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
