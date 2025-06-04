# ThatBuddy JSApp

Веб-приложение для работы с питомцами, построенное на React (фронтенд) и ASP.NET Core (бэкенд).

## 🏗️ Сборка приложения

### Быстрая сборка

Для быстрой сборки всего приложения используйте один из следующих способов:

#### Вариант 1: Используя скрипты
```bash
# Linux/macOS
./build.sh

# Windows
build.bat
```

### Пошаговая сборка

#### 1. Установка зависимостей
```bash
# Установка зависимостей клиента
cd thatbuddy_jsapp.client
npm install
cd ..
```

#### 2. Сборка фронтенда
```bash
# Сборка React приложения
cd thatbuddy_jsapp.client
npm run build
cd ..
```

#### 3. Сборка бэкенда
```bash
# Сборка .NET приложения
cd thatbuddy_jsapp.Server
dotnet build -c Release -o publish
cd ..
```

#### 4. Копирование фронтенда
```bash
# Копирование собранного фронтенда в папку сервера
cp -r thatbuddy_jsapp.client/dist thatbuddy_jsapp.Server/publish/wwwroot
```

### Автоматизированная сборка

Проект поддерживает автоматическую сборку через MSBuild. При выполнении команды:
```bash
cd thatbuddy_jsapp.Server
dotnet publish -c Release -o publish
```

Автоматически выполнится:
1. Установка зависимостей клиента
2. Сборка React приложения
3. Копирование результатов в папку publish

## 🐳 Docker

### Сборка Docker образа

#### Простая сборка (после локальной сборки)
```bash
docker build -t thatbuddy-jsapp ./thatbuddy_jsapp.Server
```

## SSL и развертывание

### Временный nginx.conf для сертификата

```nginx
events {}

http {
    server {
        listen 80;
        server_name mapmylove.ru;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://app:8080;
        }
    }
}
```

### Получение SSL сертификата
```bash
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email liretmat@gmail.com --agree-tos --no-eff-email -d mapmylove.ru
```