# 1️⃣ Build aşaması (SDK)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# .csproj dosyasını kopyala ve restore et
COPY Uni2ClupProjectBackend.csproj ./
RUN dotnet restore Uni2ClupProjectBackend.csproj

# Kaynak kodlarını kopyala ve yayınla
COPY . .
RUN dotnet publish Uni2ClupProjectBackend.csproj -c Release -o /app/out

# 2️⃣ Runtime aşaması (küçük imaj)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Uni2ClupProjectBackend.dll"]
