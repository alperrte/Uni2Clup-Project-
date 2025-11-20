using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Uni2ClupProjectBackend.Data;

namespace Uni2ClupProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DepartmentController(AppDbContext db)
        {
            _db = db;
        }

        // 📋 Tüm bölümleri listele
        [HttpGet]
        public async Task<IActionResult> GetAllDepartments()
        {
            var departments = await _db.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .Select(d => new
                {
                    id = d.Id,
                    name = d.Name,
                    code = d.Code
                })
                .ToListAsync();

            return Ok(departments);
        }
    }
}


