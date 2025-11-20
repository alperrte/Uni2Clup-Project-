using Uni2ClupProjectBackend.Models;

public class ClubMember
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int ClubId { get; set; }
    public Club Club { get; set; }

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
