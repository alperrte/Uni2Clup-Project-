namespace Uni2ClupProjectBackend.DTOs
{
	public class StudentApplicationCreateDto
	{
		public string Name { get; set; }
		public string Surname { get; set; }
		public string Email { get; set; }
		public int DepartmentId { get; set; }
	}
}
