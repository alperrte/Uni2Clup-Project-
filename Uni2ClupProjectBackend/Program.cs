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
            ValidateIssuer = false,  
            ValidateAudience = false,
            ValidateLifetime = false, 
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role,   
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
            Email = "admin@dogus.edu.tr",
            PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("123456"),
            Role = "Admin"
        });
        db.SaveChanges();
        Console.WriteLine("✅ Varsayılan Admin oluşturuldu (Database-Admin)");
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
    // ========== YAZILIM MÜHENDİSLİĞİ ==========
    new Club {
        Name = "Yazılım Geliştirme ve Teknoloji Kulübü",
        DepartmentId = deptSoftware!.Id,
        Description = "Modern yazılım geliştirme teknikleri, web & mobil uygulamalar, yapay zekâ ve siber güvenlik üzerine teknik eğitimler ve proje çalışmaları yürütür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Hackathon ve Ürün Geliştirme Kulübü",
        DepartmentId = deptSoftware!.Id,
        Description = "Öğrencilerin gerçek problemler için hızlı prototip geliştirerek takım çalışması, algoritma tasarımı ve ürün geliştirme becerileri kazandığı uygulamalı bir topluluktur.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== BİLGİSAYAR MÜHENDİSLİĞİ ==========
    new Club {
        Name = "Yapay Zekâ ve Veri Bilimi Araştırma Kulübü",
        DepartmentId = deptComputer!.Id,
        Description = "Veri bilimi, makine öğrenmesi, derin öğrenme ve yapay zekâ alanlarında araştırmalar, modelleme çalışmaları ve yarışma hazırlıkları yapan akademik bir topluluktur.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Siber Güvenlik ve Etik Hacker Kulübü",
        DepartmentId = deptComputer!.Id,
        Description = "Ağ güvenliği, kriptoloji, sızma testleri ve dijital savunma uygulamaları üzerine atölye ve simülasyon tabanlı çalışmalar düzenler.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== ELEKTRİK-ELEKTRONİK MÜH. ==========
    new Club {
        Name = "Robotik Sistemler ve Otomasyon Kulübü",
        DepartmentId = deptEEE!.Id,
        Description = "Robot tasarımı, sensör teknolojileri, devre sistemleri ve gömülü yazılım üzerine uygulamalı projeler ve yarışma takımları oluşturur.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Enerji Sistemleri ve Elektrik Teknolojileri Kulübü",
        DepartmentId = deptEEE!.Id,
        Description = "Yenilenebilir enerji, güç sistemleri, elektrik makineleri ve enerji verimliliği üzerine akademik çalışmalar ve teknik geziler düzenler.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== ENDÜSTRİ MÜHENDİSLİĞİ ==========
    new Club {
        Name = "Süreç Yönetimi ve Yalın Üretim Kulübü",
        DepartmentId = deptIE!.Id,
        Description = "Operasyon analizi, yalın üretim, süreç optimizasyonu ve verimlilik mühendisliği alanlarında uygulamalar ve proje çalışmaları yürütür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Proje Yönetimi ve Liderlik Kulübü",
        DepartmentId = deptIE!.Id,
        Description = "PMI metodolojisi, risk yönetimi, planlama, inovasyon ve kurumsal strateji üzerine eğitimler veren profesyonel bir kulüptür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== MAKİNE MÜHENDİSLİĞİ ==========
    new Club {
        Name = "Mekanik Tasarım ve CAD Kulübü",
        DepartmentId = deptME!.Id,
        Description = "3D modelleme, mekanik sistem tasarımı, CAD/CAM yazılımları ve imalat teknikleri üzerine uygulamalı çalışmalar yürütür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Termodinamik ve Enerji Sistemleri Kulübü",
        DepartmentId = deptME!.Id,
        Description = "Enerji dönüşüm süreçleri, akışkanlar mekaniği, motor sistemleri ve yenilikçi mühendislik çözümleri üzerine akademik faaliyetler düzenler.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== İNŞAAT MÜHENDİSLİĞİ ==========
    new Club {
        Name = "Yapı Tasarım ve Teknolojileri Kulübü",
        DepartmentId = deptCE!.Id,
        Description = "Yapı statiği, modern yapı malzemeleri, mimari tasarım ve deprem mühendisliği üzerine teknik etkinlikler düzenler.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Geoteknik ve Arazi İnceleme Kulübü",
        DepartmentId = deptCE!.Id,
        Description = "Zemin mekaniği, şantiye uygulamaları, arazi analizi ve saha çalışmaları üzerine öğrencileri pratik becerilerle buluşturan bir topluluktur.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== İŞLETME ==========
    new Club {
        Name = "Girişimcilik ve Startup Geliştirme Kulübü",
        DepartmentId = deptBUS!.Id,
        Description = "İş planı geliştirme, girişim fikri üretme, yatırımcı sunumları, inovasyon ve pazarlama stratejileri üzerine etkinlikler yürütür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Pazarlama ve Marka Yönetimi Kulübü",
        DepartmentId = deptBUS!.Id,
        Description = "Dijital pazarlama, marka stratejileri, tüketici davranışı ve sektör analizleri üzerine çalıştay ve workshop düzenleyen bir topluluktur.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== PSİKOLOJİ ==========
    new Club {
        Name = "Psikolojik Araştırmalar ve Klinik Çalışmalar Kulübü",
        DepartmentId = deptPSY!.Id,
        Description = "Klinik psikoloji, bilişsel davranış modelleri, mental sağlık ve akademik araştırmalar üzerine uygulama ve seminerler düzenler.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "İnsan Davranışı ve Sosyal Etkileşim Kulübü",
        DepartmentId = deptPSY!.Id,
        Description = "Sosyal psikoloji, iletişim becerileri, topluluk davranışları ve öğrenci yaşamı üzerine bilimsel analizler ve etkinlikler gerçekleştirir.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },

    // ========== HUKUK ==========
    new Club {
        Name = "Hukuki Farkındalık ve Toplumsal Adalet Kulübü",
        DepartmentId = deptLAW!.Id,
        Description = "Temel hukuk eğitimleri, dava analizleri, etik tartışmalar ve sosyal adalet projeleri üzerine çalışmalar yürütür.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    },
    new Club {
        Name = "Moot Court ve Akademik Tartışma Kulübü",
        DepartmentId = deptLAW!.Id,
        Description = "Öğrencilerin mahkeme simülasyonlarına hazırlanarak savunma, analiz ve ikna becerilerini geliştirdikleri akademik bir topluluk.",
        IsActive = true, CreatedAt = DateTime.UtcNow
    }
};


        db.Clubs.AddRange(clubs);
        db.SaveChanges();
        Console.WriteLine("✅ 20 varsayılan kulüp oluşturuldu");
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


app.UseMiddleware<Uni2ClupProjectBackend.Status.UserStatusMiddleware>();

app.MapControllers();
app.Run();


app.Run();