using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http.Json;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Security.Claims;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using Uni2ClupProjectBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// ✅ JSON UTF-8 Ayarları
Console.OutputEncoding = Encoding.UTF8;
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// ✅ MSSQL Bağlantısı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings__DefaultConnection"];
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

// ✅ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ✅ Servis Injection
builder.Services.AddScoped<UserService>();
//email servisi
builder.Services.AddScoped<EmailService>();


// ✅ JWT Ayarları
var jwtKey = builder.Configuration["Jwt__Key"] ?? "qwertyuiopasdfghjklzxcvbnm123456";
var jwtIssuer = builder.Configuration["Jwt__Issuer"] ?? "Uni2ClupApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,  // ❌ Issuer kontrolünü devre dışı bırak
            ValidateAudience = false,
            ValidateLifetime = false, // 🔥 TEST İÇİN: Token süresi kontrolünü geçici olarak devre dışı bırak
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role,   // ✅ DOĞRU ROLE TİPİ
            NameClaimType = ClaimTypes.Email
        };
    });

builder.Services.AddAuthorization();

// ✅ Controller servisleri kaydet
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ Migration + Varsayılan Admin Kullanıcı
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Users.Any())
    {
        db.Users.Add(new User
        {
            Name = "Alper",
            Surname = "Temiz",
            Email = "202303011111@dogus.edu.tr",
            PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("123456"),
            Role = "Admin"
        });
        db.SaveChanges();
        Console.WriteLine("✅ Varsayılan Admin oluşturuldu (Alper - Admin)");
    }

    // ✅ Varsayılan Bölümler
    if (!db.Departments.Any())
    {
        var departments = new List<Department>
        {
            new Department { Name = "Yazılım Mühendisliği", Code = "SWE", IsActive = true },
            new Department { Name = "Bilgisayar Mühendisliği", Code = "CSE", IsActive = true },
            new Department { Name = "Elektrik-Elektronik Mühendisliği", Code = "EEE", IsActive = true },
            new Department { Name = "Endüstri Mühendisliği", Code = "IE", IsActive = true },
            new Department { Name = "Makine Mühendisliği", Code = "ME", IsActive = true },
            new Department { Name = "İnşaat Mühendisliği", Code = "CE", IsActive = true },
            new Department { Name = "Çevre Mühendisliği", Code = "ENV", IsActive = true },
            new Department { Name = "İşletme", Code = "BUS", IsActive = true },
            new Department { Name = "İktisat", Code = "ECO", IsActive = true },
            new Department { Name = "Psikoloji", Code = "PSY", IsActive = true },
            new Department { Name = "Sosyoloji", Code = "SOC", IsActive = true },
            new Department { Name = "Siyaset Bilimi", Code = "POL", IsActive = true },
            new Department { Name = "Hukuk", Code = "LAW", IsActive = true },
            new Department { Name = "İletişim", Code = "COM", IsActive = true },
            new Department { Name = "Güzel Sanatlar", Code = "FA", IsActive = true },
            new Department { Name = "Müzik", Code = "MUS", IsActive = true },
            new Department { Name = "Yabancı Diller", Code = "FL", IsActive = true },
            new Department { Name = "Fen Bilimleri", Code = "SCI", IsActive = true },
            new Department { Name = "Matematik", Code = "MATH", IsActive = true },
            new Department { Name = "Fizik", Code = "PHY", IsActive = true },
            new Department { Name = "Kimya", Code = "CHEM", IsActive = true },
            new Department { Name = "Biyoloji", Code = "BIO", IsActive = true },
            new Department { Name = "Beden Eğitimi", Code = "PE", IsActive = true }
        };

        db.Departments.AddRange(departments);
        db.SaveChanges();
        Console.WriteLine("✅ Varsayılan bölümler oluşturuldu");
    }

    // ✅ Varsayılan Kulüpler (11 adet - Yazılım Mühendisliği kulübü eklendi)
    if (!db.Clubs.Any())
    {
        var deptSoftware = db.Departments.FirstOrDefault(d => d.Name == "Yazılım Mühendisliği");
        var deptComputer = db.Departments.FirstOrDefault(d => d.Name == "Bilgisayar Mühendisliği");
        var deptEE = db.Departments.FirstOrDefault(d => d.Name == "Elektrik-Elektronik Mühendisliği");
        var deptBusiness = db.Departments.FirstOrDefault(d => d.Name == "İşletme");
        var deptSocial = db.Departments.FirstOrDefault(d => d.Name == "Sosyoloji");
        var deptArts = db.Departments.FirstOrDefault(d => d.Name == "Güzel Sanatlar");
        var deptPE = db.Departments.FirstOrDefault(d => d.Name == "Beden Eğitimi");
        var deptEnv = db.Departments.FirstOrDefault(d => d.Name == "Çevre Mühendisliği");
        var deptFL = db.Departments.FirstOrDefault(d => d.Name == "Yabancı Diller");
        var deptSci = db.Departments.FirstOrDefault(d => d.Name == "Fen Bilimleri");
        var deptCom = db.Departments.FirstOrDefault(d => d.Name == "İletişim");

        var clubs = new List<Club>
        {
            new Club { Name = "Yazılım Mühendisliği Kulübü", DepartmentId = deptSoftware!.Id, Description = "Yazılım mühendisliği öğrencilerine yönelik teknik etkinlikler, proje geliştirme ve sektör bağlantıları sağlayan kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Yazılım Geliştirme Kulübü", DepartmentId = deptComputer!.Id, Description = "Yazılım geliştirme, programlama dilleri ve teknolojileri üzerine çalışmalar yapan kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Robotik ve Otomasyon Kulübü", DepartmentId = deptEE!.Id, Description = "Robotik projeler, otomasyon sistemleri ve yapay zeka uygulamaları geliştiren kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Girişimcilik ve İnovasyon Kulübü", DepartmentId = deptBusiness!.Id, Description = "Girişimcilik ekosistemi, startup projeleri ve inovasyon çalışmaları yürüten kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Sosyal Sorumluluk Kulübü", DepartmentId = deptSocial!.Id, Description = "Toplumsal sorunlara çözüm üretmek ve sosyal projeler geliştirmek için çalışan kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Müzik ve Sanat Kulübü", DepartmentId = deptArts!.Id, Description = "Müzik, resim, tiyatro ve diğer sanat dallarında etkinlikler düzenleyen kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Spor ve Sağlık Kulübü", DepartmentId = deptPE!.Id, Description = "Spor aktiviteleri, sağlıklı yaşam ve fitness programları organize eden kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Çevre ve Sürdürülebilirlik Kulübü", DepartmentId = deptEnv!.Id, Description = "Çevre koruma, sürdürülebilirlik ve yeşil teknolojiler üzerine çalışan kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Dil ve Kültür Kulübü", DepartmentId = deptFL!.Id, Description = "Dil öğrenimi, kültürel etkinlikler ve uluslararası değişim programları düzenleyen kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Bilim ve Araştırma Kulübü", DepartmentId = deptSci!.Id, Description = "Bilimsel araştırmalar, akademik çalışmalar ve bilimsel etkinlikler organize eden kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Club { Name = "Medya ve İletişim Kulübü", DepartmentId = deptCom!.Id, Description = "Medya, gazetecilik, dijital içerik üretimi ve iletişim projeleri yürüten kulüp.", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        db.Clubs.AddRange(clubs);
        db.SaveChanges();
        Console.WriteLine("✅ 11 varsayılan kulüp oluşturuldu");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();