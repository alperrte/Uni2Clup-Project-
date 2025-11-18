using System.ComponentModel.DataAnnotations.Schema;
using Uni2ClupProjectBackend.Models;

public class StudentApplication
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Email { get; set; }
    public int DepartmentId { get; set; }
    
    [ForeignKey("DepartmentId")]
    public Department? Department { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Beklemede";
}
