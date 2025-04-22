using Microsoft.AspNetCore.Identity;

namespace thatbuddy_jsapp.Server.Models
{
    public class UserModel : IdentityUser<Guid>
    {
        public string? Name { get; set; }
        public string Role { get; set; } = "user"; 
        public string? LogoUrl { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeletedAt { get; set; }
    }

    public class Role : IdentityRole<Guid> 
    {
    }
}