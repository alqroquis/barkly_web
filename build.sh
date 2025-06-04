#!/bin/bash

# Скрипт для полной сборки приложения
set -e  # Остановить выполнение при ошибке

echo "🚀 Начинаем сборку приложения..."

# Цвета для красивого вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Шаг 1: Установка зависимостей клиента...${NC}"
cd thatbuddy_jsapp.client
npm install

echo -e "${BLUE}🏗️  Шаг 2: Сборка фронтенда...${NC}"
npm run build

echo -e "${BLUE}⚙️  Шаг 3: Сборка сервера...${NC}"
cd ../thatbuddy_jsapp.Server
dotnet build -c Release -o publish

echo -e "${BLUE}📁 Шаг 4: Копирование фронтенда в папку publish...${NC}"
# Удаляем старый wwwroot если существует
if [ -d "publish/wwwroot" ]; then
    rm -rf publish/wwwroot
fi

# Копируем собранный фронтенд
cp -r ../thatbuddy_jsapp.client/dist publish/wwwroot

echo -e "${GREEN}✅ Сборка завершена успешно!${NC}"
echo -e "${YELLOW}📂 Результат сборки находится в: thatbuddy_jsapp.Server/publish${NC}"
echo -e "${YELLOW}🐳 Для создания Docker образа выполните: docker build -t your-app-name ./thatbuddy_jsapp.Server${NC}"
