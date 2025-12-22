using System;

namespace Uni2ClupProjectBackend.Models
{
    public class Announcement
    {
        public int Id { get; set; }

        
        public int EventId { get; set; }

        
        public Event Event { get; set; }

        
        public string Message { get; set; } = string.Empty;

        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
