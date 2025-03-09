using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
}

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(255)]
    public string Email { get; set; }

    [StringLength(100)]
    public string Name { get; set; }

    [StringLength(500)]
    public string Avatar { get; set; } // Фото профиля

    [Required]
    [StringLength(50)]
    public string Provider { get; set; } // google / yandex

    [Required]
    [StringLength(100)]
    public string ProviderId { get; set; } // Уникальный ID в OAuth

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid(); // Уникальный ID токена
    public Guid UserId { get; set; } // ID пользователя (Foreign Key)
    public string Token { get; set; } = string.Empty; // Сам refresh-токен
    public DateTime ExpiresAt { get; set; } // Дата истечения токена

    // Навигационное свойство (связь с таблицей users)
    public User User { get; set; } = null!;
}
