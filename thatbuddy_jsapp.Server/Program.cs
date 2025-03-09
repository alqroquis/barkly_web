using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AspNet.Security.OAuth.Yandex;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Добавление сервисов аутентификации
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = YandexAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddYandex("Yandex", options =>
{
    options.ClientId = builder.Configuration["YandexAuth:ClientId"];
    options.ClientSecret = builder.Configuration["YandexAuth:ClientSecret"];
    options.CallbackPath = new PathString("/auth/yandex/callback");
    options.AuthorizationEndpoint = "https://oauth.yandex.ru/authorize";
    options.TokenEndpoint = "https://oauth.yandex.ru/token";
})
    .AddGoogle("Google", options =>
    {
        options.ClientId = builder.Configuration["GoogleAuth:ClientId"];
        options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"];
    });

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://localhost:5173",
            "https://oauth.yandex.ru",
            "https://localhost:7259")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

