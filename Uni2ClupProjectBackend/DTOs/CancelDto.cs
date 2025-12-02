namespace Uni2ClupProjectBackend.DTOs
{
	public class CancelDto
	{
		public string? Reason { get; set; }
		public bool NotifyStudents { get; set; } = true;
	}
}
