FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Копируем только собранные файлы из папки publish
COPY ./publish ./
ENTRYPOINT ["dotnet", "thatbuddy_jsapp.Server.dll"]