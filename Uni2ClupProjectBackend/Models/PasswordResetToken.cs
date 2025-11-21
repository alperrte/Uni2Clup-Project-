namespace Uni2ClupProjectBackend.Models
{
	public class PasswordResetToken
	{
		public int Id { get; set; }
		public string Email { get; set; } = string.Empty;
		public string Token { get; set; } = string.Empty;
		public DateTime ExpireAt { get; set; }
	}
}
