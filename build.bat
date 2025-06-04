@echo off
REM Скрипт для полной сборки приложения в Windows
setlocal EnableDelayedExpansion

echo 🚀 Начинаем сборку приложения...

echo 📦 Шаг 1: Установка зависимостей клиента...
cd thatbuddy_jsapp.client
call npm install
if !ERRORLEVEL! neq 0 (
    echo ❌ Ошибка при установке зависимостей
    exit /b 1
)

echo 🏗️  Шаг 2: Сборка фронтенда...
call npm run build
if !ERRORLEVEL! neq 0 (
    echo ❌ Ошибка при сборке фронтенда
    exit /b 1
)

echo ⚙️  Шаг 3: Сборка сервера...
cd ..\thatbuddy_jsapp.Server
dotnet build -c Release -o publish
if !ERRORLEVEL! neq 0 (
    echo ❌ Ошибка при сборке сервера
    exit /b 1
)

echo 📁 Шаг 4: Копирование фронтенда в папку publish...
if exist "publish\wwwroot" rmdir /s /q "publish\wwwroot"
xcopy "..\thatbuddy_jsapp.client\dist" "publish\wwwroot\" /s /e /i

echo ✅ Сборка завершена успешно!
echo 📂 Результат сборки находится в: thatbuddy_jsapp.Server\publish
echo 🐳 Для создания Docker образа выполните: docker build -t your-app-name .\thatbuddy_jsapp.Server
