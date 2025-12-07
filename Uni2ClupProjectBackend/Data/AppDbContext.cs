using Microsoft.EntityFrameworkCore;
using Uni2ClupProjectBackend.Models;

namespace Uni2ClupProjectBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        //Kullanıcı tablosu
        public DbSet<User> Users => Set<User>();
        // Etkinlik tablosu
        public DbSet<Event> Events => Set<Event>();
        // Öğrenci başvuru tablosu
        public DbSet<StudentApplication> StudentApplications { get; set; }
        // Kulüp tablosu
        public DbSet<Club> Clubs => Set<Club>();
        // Bölüm tablosu
        public DbSet<Department> Departments => Set<Department>();
        // Kulüp üyesi tablosu
        public DbSet<ClubMember> ClubMembers => Set<ClubMember>();
        // Etkinlik katılımcı tablosu
        public DbSet<EventParticipant> EventParticipants => Set<EventParticipant>();
        // Bildirim tablosu
        public DbSet<Notification> Notifications => Set<Notification>();
        // Şifre sıfırlama token tablosu
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        // Geçmiş kulüp yöneticileri tablosu
        public DbSet<PastClubManager> PastClubManagers { get; set; }
        // Etkinlik değerlendirme tablosu
        public DbSet<EventRating> EventRatings => Set<EventRating>();
        // Duyurular tablosu
        public DbSet<Announcement> Announcements => Set<Announcement>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}