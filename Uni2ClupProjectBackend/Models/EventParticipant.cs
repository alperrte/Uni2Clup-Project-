using Uni2ClupProjectBackend.Models;

public class EventParticipant
{
    public int Id { get; set; }

    public int EventId { get; set; }
    public Event Event { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
