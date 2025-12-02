namespace Uni2ClupProjectBackend.Models
{
    public class PastClubManager
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ClubName { get; set; } = string.Empty;
        public DateTime RemovedAt { get; set; }
    }
}
