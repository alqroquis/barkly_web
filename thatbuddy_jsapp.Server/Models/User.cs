using Microsoft.AspNetCore.Identity;

namespace thatbuddy_jsapp.Server.Models
{
    public class User : IdentityUser<Guid>
    {
        public string Email { get; set; }                  // Электронная почта
        public string PasswordHash { get; set; }           // Хеш пароля
        public string Name { get; set; }                   // Имя пользователя
        public string Role { get; set; } = "user";         // Роль пользователя
        public string LogoUrl { get; set; }               // URL логотипа
        public string RefreshToken { get; set; }           // Рефреш-токен
        public DateTime RefreshTokenExpiryTime { get; set; } // Время истечения рефреш-токена
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Дата создания
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Дата обновления
        public DateTime? DeletedAt { get; set; }           // Дата удаления (мягкое удаление)
    }

    public class Role : IdentityRole<Guid> // Используем Guid как тип идентификатора
    {
    }
}