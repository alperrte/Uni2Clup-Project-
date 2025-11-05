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
