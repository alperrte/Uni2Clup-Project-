using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Http.Json;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ UTF-8 karakter seti
Console.OutputEncoding = Encoding.UTF8;

// JSON yapılandırmasını Configure<JsonOptions> ile koruyoruz (Unicode desteği)
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    options.SerializerOptions.PropertyNamingPolicy = null; // PascalCase koru
    options.SerializerOptions.PropertyNameCaseInsensitive = true; // Küçük/büyük farkı kaldır
});

// 2️⃣ Veritabanı bağlantısı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3️⃣ CORS (React için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// 4️⃣ Controller + JSON ayarları
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        // 🔥 Türkçe karakter ve PascalCase garanti
        o.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
        o.JsonSerializerOptions.PropertyNamingPolicy = null;          // PascalCase koru
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;   // Küçük/büyük farkı kaldır
        o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5️⃣ Migration + Varsayılan kullanıcı ekle
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
            PasswordHash = "123456",
            Role = "User"
        });
        db.SaveChanges();
        Console.WriteLine("✅ Varsayılan kullanıcı eklendi.");
    }
}

// 6️⃣ Swagger ve pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
// app.UseHttpsRedirection(); // Docker için kapalı
app.UseAuthorization();

app.MapControllers();

app.Run();
