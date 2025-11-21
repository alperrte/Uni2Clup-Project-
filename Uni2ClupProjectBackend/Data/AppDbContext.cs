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
        public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
        public DbSet<EventParticipant> EventParticipants => Set<EventParticipant>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

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