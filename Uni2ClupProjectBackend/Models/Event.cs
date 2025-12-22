using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Uni2ClupProjectBackend.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public int Capacity { get; set; }

        
        public int ClubId { get; set; }
        public Club Club { get; set; }

        public string Description { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string CreatedBy { get; set; } = "";
        
        public bool IsCancelled { get; set; } = false;
        public string? CancelReason { get; set; }

    }
}
