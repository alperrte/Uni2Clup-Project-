using System;

namespace Uni2ClupProjectBackend.DTOs
{
    
    public class EventCreateDto
    {
        
        public string Name { get; set; } = string.Empty;

       
        public string Location { get; set; } = string.Empty;

        
        public int Capacity { get; set; }

        
        public string Description { get; set; } = string.Empty;

        
        public DateTime StartDate { get; set; }

        
        public DateTime EndDate { get; set; }
    }
}
