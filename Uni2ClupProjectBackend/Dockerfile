# 1️⃣ Build aşaması (SDK imajı)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# .csproj dosyasını kopyala ve restore et
COPY Uni2ClupProjectBackend.csproj ./
RUN dotnet restore Uni2ClupProjectBackend.csproj

# Tüm kaynak kodları kopyala ve derle
COPY . .
RUN dotnet publish -c Release -o out

# 2️⃣ Çalışma zamanı (runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./



#port
EXPOSE 8080
ENTRYPOINT ["dotnet", "Uni2ClupProjectBackend.dll"]
