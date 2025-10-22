using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Http.Json;
using Uni2ClupProjectBackend.Data;
using Uni2ClupProjectBackend.Models;
using System.Text.Encodings.Web;
using System.Text.Unicode;

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ UTF-8 karakter seti ayarları
Console.OutputEncoding = Encoding.UTF8;
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
    options.SerializerOptions.PropertyNamingPolicy = null; // PascalCase korunsun
});

// 2️⃣ Veritabanı bağlantısı
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3️⃣ CORS - React frontend'e izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// 4️⃣ Controller + JSON ayarları (Newtonsoft kaldırıldı)
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5️⃣ Migration + Varsayılan kullanıcı
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

// 6️⃣ Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

// ❌ HTTPS redirection devre dışı (isteğe göre aç)
// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();
app.Run();
