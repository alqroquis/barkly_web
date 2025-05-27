using AspNet.Security.OAuth.Yandex;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using thatbuddy_jsapp.Server.Models;
using thatbuddy_jsapp.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Identity
builder.Services.AddIdentity<UserModel, Role>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Configure Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = YandexAuthenticationDefaults.AuthenticationScheme; // Default challenge for Yandex
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.LoginPath = "/api/Auth/Login";
    options.AccessDeniedPath = "/api/Auth/AccessDenied";
    // Ensure "Jwt:AccessTokenExpirationMinutes" is available in your appsettings.json
    options.ExpireTimeSpan = TimeSpan.FromMinutes(double.Parse(builder.Configuration["Jwt:AccessTokenExpirationMinutes"]));
})
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
})
// Add JWT Bearer authentication to support API token-based authentication
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// Add other services
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<DatabaseService>(); // From the original Program.cs

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://localhost",
                           "https://oauth.yandex.ru") // Ensure this is correct for your Yandex setup
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Configure Kestrel to listen on port 8080
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(8080); // HTTP on 8080
    // If you need HTTPS, uncomment and configure:
    // serverOptions.ListenAnyIP(8443, listenOptions => listenOptions.UseHttps());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowFrontend"); // Apply CORS policy

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    // This is typically used for SPA (Single Page Application) projects where client-side routing handles unknown paths
    endpoints.MapFallbackToFile("index.html");
});

app.Run();