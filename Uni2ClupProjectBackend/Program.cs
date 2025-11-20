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
using System.Text.Encodings.Web;
using System.Text.Unicode;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
});


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
            new Department { Name = "Hukuk", Code = "LAW", IsActive = true },
            new Department { Name = "Güzel Sanatlar", Code = "FA", IsActive = true },
            new Department { Name = "Matematik", Code = "MATH", IsActive = true },
            new Department { Name = "Fizik", Code = "PHY", IsActive = true },
            new Department { Name = "Kimya", Code = "CHEM", IsActive = true },
            new Department { Name = "Biyoloji", Code = "BIO", IsActive = true },
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
        var deptEEE = db.Departments.FirstOrDefault(d => d.Name == "Elektrik-Elektronik Mühendisliği");
        var deptIE = db.Departments.FirstOrDefault(d => d.Name == "Endüstri Mühendisliği");
        var deptME = db.Departments.FirstOrDefault(d => d.Name == "Makine Mühendisliği");
        var deptCE = db.Departments.FirstOrDefault(d => d.Name == "İnşaat Mühendisliği");
        var deptENV = db.Departments.FirstOrDefault(d => d.Name == "Çevre Mühendisliği");
        var deptBUS = db.Departments.FirstOrDefault(d => d.Name == "İşletme");
        var deptECO = db.Departments.FirstOrDefault(d => d.Name == "İktisat");
        var deptPSY = db.Departments.FirstOrDefault(d => d.Name == "Psikoloji");
        var deptLAW = db.Departments.FirstOrDefault(d => d.Name == "Hukuk");
        var deptFA = db.Departments.FirstOrDefault(d => d.Name == "Güzel Sanatlar");
        var deptMATH = db.Departments.FirstOrDefault(d => d.Name == "Matematik");
        var deptPHY = db.Departments.FirstOrDefault(d => d.Name == "Fizik");
        var deptCHEM = db.Departments.FirstOrDefault(d => d.Name == "Kimya");
        var deptBIO = db.Departments.FirstOrDefault(d => d.Name == "Biyoloji");


        var clubs = new List<Club>
        {
         new Club {
    Name = "Yazılım Mühendisliği Kulübü",
    DepartmentId = deptSoftware!.Id,
    Description = "Yazılım geliştirme, kodlama atölyeleri, hackathonlar ve sektörel seminerler düzenleyen mühendislik odaklı kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Bilgisayar Teknolojileri ve Yapay Zekâ Kulübü",
    DepartmentId = deptComputer!.Id,
    Description = "Bilgisayar mühendisliği öğrencileri için yapay zekâ, veri bilimi, algoritmalar ve donanım temelli projeler geliştiren kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Elektrik-Elektronik ve Robotik Sistemler Kulübü",
    DepartmentId = deptEEE!.Id,
    Description = "Elektronik devreler, robotik sistemler, gömülü yazılım ve IoT projeleri üzerine çalışan teknik kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Endüstri ve Yönetim Bilimleri Kulübü",
    DepartmentId = deptIE!.Id,
    Description = "Verimlilik, süreç yönetimi, operasyon araştırmaları ve kurumsal yönetim becerilerini geliştiren akademik kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Makine Tasarım ve İmalat Kulübü",
    DepartmentId = deptME!.Id,
    Description = "Mekanik tasarım, CAD/CAM, üretim teknolojileri ve mühendislik projeleri üzerine çalışmalar yapan kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "İnşaat Teknolojileri ve Yapı Bilimleri Kulübü",
    DepartmentId = deptCE!.Id,
    Description = "Yapı mühendisliği, yapı malzemeleri, statik-dinamik analiz ve mimari projelerde faaliyet gösteren kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Çevre ve Sürdürülebilir Kalkınma Kulübü",
    DepartmentId = deptENV!.Id,
    Description = "Çevre sorunları, sürdürülebilirlik, iklim değişikliği ve yeşil teknoloji projeleri geliştiren topluluk.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "İşletme ve Finans Kulübü",
    DepartmentId = deptBUS!.Id,
    Description = "İşletme yönetimi, finans, pazarlama, organizasyon ve girişimcilik alanlarında etkinlikler düzenleyen kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Ekonomi ve Analitik Araştırmalar Kulübü",
    DepartmentId = deptECO!.Id,
    Description = "Ekonomik analiz, veri yorumlama, makro-mikro ekonomi çalışmaları ve akademik araştırmalar yapan kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Psikoloji ve İnsan Davranışları Kulübü",
    DepartmentId = deptPSY!.Id,
    Description = "Psikoloji bilimi, insan davranışları, mental sağlık, araştırma ve seminer çalışmaları yürüten kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Hukuk ve Adalet Çalışmaları Kulübü",
    DepartmentId = deptLAW!.Id,
    Description = "Hukuki farkındalık, dava analizleri, akademik çalışmalar ve sosyal hukuk projeleri düzenleyen kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Güzel Sanatlar ve Tasarım Kulübü",
    DepartmentId = deptFA!.Id,
    Description = "Resim, heykel, müzik, sinema, tiyatro ve diğer sanat dallarında projeler ve atölyeler oluşturan kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Matematik Araştırmaları ve Analiz Kulübü",
    DepartmentId = deptMATH!.Id,
    Description = "Teorik matematik, uygulamalı matematik, modelleme ve bilimsel araştırmalar üzerine çalışan akademik kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Fizik ve Bilimsel Keşifler Kulübü",
    DepartmentId = deptPHY!.Id,
    Description = "Deneysel fizik, astronomi, teorik çalışmalar ve bilimsel keşifler konusunda etkinlikler düzenleyen kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Kimya ve Laboratuvar Teknolojileri Kulübü",
    DepartmentId = deptCHEM!.Id,
    Description = "Kimyasal analizler, laboratuvar çalışmaları, araştırma projeleri ve bilimsel aktiviteler gerçekleştiren kulüp.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

new Club {
    Name = "Biyoloji ve Genetik Araştırmalar Kulübü",
    DepartmentId = deptBIO!.Id,
    Description = "Biyoloji, biyoteknoloji, genetik ve laboratuvar araştırmaları alanında etkinlikler düzenleyen bilim kulübü.",
    IsActive = true, CreatedAt = DateTime.UtcNow
},

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