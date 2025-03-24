using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Crypto.Generators;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using thatbuddy_jsapp.Server.Models;
using thatbuddy_jsapp.Server.Services;
using LoginRequest = thatbuddy_jsapp.Server.Models.LoginRequest;
using RegisterRequest = thatbuddy_jsapp.Server.Models.RegisterRequest;

namespace thatbuddy_jsapp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly DatabaseService _databaseService;

        public AuthController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration)
        {
            _databaseService = databaseService;
            _tokenService = tokenService;
            _configuration = configuration;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUser = await _databaseService.GetUserByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest(new { Message = "Пользователь с указанным логином уже существует." });
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new UserModel
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                Name = request.Name,
                Role = "user", 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _databaseService.CreateUserAsync(user);

            return Ok(new { Message = "Успешно!" });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _databaseService.GetUserByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(new { Message = "Пользователь с указанным логином не найден." });

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { Message = "Неверный пароль." });
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(double.Parse(_configuration["Jwt:RefreshTokenExpirationDays"]!));
            await _databaseService.UpdateUserRefreshTokenAsync(user.Id, refreshToken, user.RefreshTokenExpiryTime);
           
            Response.Cookies.Append("AccessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]!))
            });

            Response.Cookies.Append("RefreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = user.RefreshTokenExpiryTime
            });

            return Ok(new { Message = "Успешно!" });
        }


        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = "Token validation failed or user ID not found" });
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            return Ok(new
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                LogoUrl = user.LogoUrl,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
            });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("AccessToken");
            Response.Cookies.Delete("RefreshToken");

            return Ok(new { Message = "Успешно!" });
        }


        //[HttpPost("refresh-token")]
        //public async Task<IActionResult> RefreshToken()
        //{
        //    Получаем Refresh Token из cookie
        //   var refreshToken = Request.Cookies["RefreshToken"];

        //    if (string.IsNullOrEmpty(refreshToken))
        //        return Unauthorized("Refresh token is missing");

        //    Получаем пользователя по Refresh Token
        //   var user = await _databaseService.GetUserByRefreshTokenAsync(refreshToken);

        //    if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        //        return Unauthorized("Invalid refresh token");

        //    Генерируем новый Access Token
        //    var newAccessToken = _tokenService.GenerateAccessToken(user);

        //    Обновляем Access Token в cookie
        //    Response.Cookies.Append("AccessToken", newAccessToken, new CookieOptions
        //    {
        //        HttpOnly = true,
        //        Secure = true,
        //        SameSite = SameSiteMode.Strict,
        //        Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:AccessTokenExpirationMinutes"]))
        //    });

        //    return Ok(new { AccessToken = newAccessToken });
        //}
    }
}