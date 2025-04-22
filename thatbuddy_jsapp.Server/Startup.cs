using AspNet.Security.OAuth.Yandex;
using Microsoft.AspNetCore.Authentication.Cookies;
using thatbuddy_jsapp.Server.Services;

public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = YandexAuthenticationDefaults.AuthenticationScheme;
        })
        .AddCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.LoginPath = "/api/Auth/Login";
            options.AccessDeniedPath = "/api/Auth/AccessDenied";
            options.ExpireTimeSpan = TimeSpan.FromMinutes(double.Parse(Configuration["Jwt:AccessTokenExpirationMinutes"])); 
        })
        .AddYandex("Yandex", options =>
        {
            options.ClientId = Configuration["YandexAuth:ClientId"];
            options.ClientSecret = Configuration["YandexAuth:ClientSecret"];
            options.CallbackPath = new PathString("/auth/yandex/callback");
            options.AuthorizationEndpoint = "https://oauth.yandex.ru/authorize";
            options.TokenEndpoint = "https://oauth.yandex.ru/token";
        })
        .AddGoogle("Google", options =>
        {
            options.ClientId = Configuration["GoogleAuth:ClientId"];
            options.ClientSecret = Configuration["GoogleAuth:ClientSecret"];
        });

        services.AddControllers();
        services.AddSwaggerGen();
        services.AddScoped<TokenService>();
        services.AddScoped<IFileService, FileService>();
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
                policy.WithOrigins("https://localhost",
                    "https://oauth.yandex.ru")
                      .AllowCredentials()
                      .AllowAnyHeader()
                      .AllowAnyMethod());
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseCors("AllowFrontend");
        app.UseAuthentication();
        app.UseRouting();
        app.UseAuthorization();
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}