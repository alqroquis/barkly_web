using AspNet.Security.OAuth.Yandex;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("auth")]
public class AuthController : Controller
{
    [HttpGet("login/yandex")]
    public IActionResult LoginWithYandex()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(YandexCallback), "Auth")
        };

        return Challenge(properties, "Yandex"); // Название схемы из AddOAuth()
    }

    [HttpGet("yandex/callback")]
    public async Task<IActionResult> YandexCallback()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync("yandex");

        if (!authenticateResult.Succeeded)
        {
            return BadRequest("Ошибка аутентификации через Yandex");
        }

        var claims = authenticateResult.Principal.Identities.FirstOrDefault()?.Claims;
        var userId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

        // Можно сохранить пользователя в БД или создать JWT-токен
        return Ok(new { userId, email });
    }



    [HttpGet("logout")]
    public IActionResult Logout()
    {
        return SignOut(new AuthenticationProperties { RedirectUri = "/" },
            CookieAuthenticationDefaults.AuthenticationScheme);
    }

    [Authorize]
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Json(claims);
    }
}
