using System;

namespace Uni2ClupProjectBackend.DTOs
{
    public class AnnouncementCreateDto
    {
        public int EventId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
