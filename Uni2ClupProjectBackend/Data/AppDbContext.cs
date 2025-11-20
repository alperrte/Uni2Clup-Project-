using Microsoft.EntityFrameworkCore;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Mevcut tablolar
        public DbSet<User> Users => Set<User>();
        public DbSet<Event> Events => Set<Event>();
        public DbSet<StudentApplication> StudentApplications { get; set; }
        public DbSet<Club> Clubs => Set<Club>();
        public DbSet<Department> Departments => Set<Department>();

        // ⭐ YENİ EKLEDİĞİMİZ TABLO (DUYURULAR)
        public DbSet<Announcement> Announcements => Set<Announcement>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User email unique constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}