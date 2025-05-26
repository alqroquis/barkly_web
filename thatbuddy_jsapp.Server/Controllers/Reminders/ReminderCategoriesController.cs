using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Org.BouncyCastle.Asn1.Ocsp;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Reminders
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReminderCategoriesController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        /// <summary>
        /// Получение списка категорий напоминаний
        /// </summary>
        /// <returns>Список категорий</returns>
        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }
            #endregion

            #region Получение списка
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var query = @"
                SELECT id as Id, 
                       name as Name, 
                       description as Description,
                       color as Color,
                       created_at as CreatedAt, 
                       updated_at as UpdatedAt
                FROM reminder_categories
                WHERE deleted_at IS NULL
                ORDER BY name;";

                try
                {
                    var categories = await connection.QueryAsync<ReminderCategory>(query);
                    return Ok(categories);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting reminder categories: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }
    }
}
