using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Users
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var currentUser = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                var userQuery = @"
                    SELECT id as Id, name as Name, email as Email, logo_url as LogoUrl, role as Role, created_at as CreatedAt
                    FROM users
                    WHERE id = @UserId AND deleted_at IS NULL";

                var user = await connection.QueryFirstOrDefaultAsync<UserDto>(userQuery, new { UserId = userGuid });

                if (user == null)
                {
                    return NotFound(new { Message = "Пользователь не найден" });
                }

                // Проверяем активный платный тариф
                var tariffQuery = @"
                    SELECT COUNT(*) 
                    FROM user_subscriptions us
                    JOIN tariffs t ON us.tariff_id = t.id
                    WHERE us.user_id = @UserId
                    AND us.is_active = true
                    AND us.end_date > NOW()
                    AND t.price > 0
                    AND us.deleted_at IS NULL";

                user.HasPaidTariff = await connection.ExecuteScalarAsync<bool>(tariffQuery, new { UserId = userGuid });

                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }


        // GET: api/users/tariff - Получение информации о тарифе
        [HttpGet("tariff")]
        public async Task<ActionResult<TariffInfoDto>> GetUserTariffInfo()
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var currentUser = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                // Получаем активный тариф
                var tariffQuery = @"
                    SELECT t.name as Name, t.description as Description, t.max_pets as MaxPets
                    FROM user_subscriptions us
                    JOIN tariffs t ON us.tariff_id = t.id
                    WHERE us.user_id = @UserId
                    AND us.is_active = true
                    AND us.end_date > NOW()
                    AND us.deleted_at IS NULL
                    ORDER BY us.end_date DESC
                    LIMIT 1";

                var tariff = await connection.QueryFirstOrDefaultAsync<TariffInfoDto>(tariffQuery, new { UserId = userGuid });

                // Если нет активного тарифа, используем бесплатный
                if (tariff == null)
                {
                    tariff = new TariffInfoDto
                    {
                        Name = "Бесплатный",
                        Description = "Основные функции",
                        MaxPets = 1
                    };
                }

                // Получаем количество питомцев
                var petsQuery = "SELECT COUNT(*) FROM pets WHERE user_id = @UserId AND deleted_at IS NULL";
                tariff.CurrentPets = await connection.ExecuteScalarAsync<int>(petsQuery, new { UserId = userGuid });

                return Ok(tariff);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting tariff info: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }


        // GET: api/tariffs - Получение списка доступных тарифов
        [HttpGet("tariffs")]
        public async Task<ActionResult<List<TariffDto>>> GetAvailableTariffs()
        {
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                var query = @"
            SELECT id as Id, name as Name, description as Description, 
                   price as Price, max_pets as MaxPets
            FROM tariffs
            WHERE deleted_at IS NULL
            ORDER BY price";

                var tariffs = await connection.QueryAsync<TariffDto>(query);
                return Ok(tariffs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting tariffs: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }

        [HttpPost("change-tariff")]
        public async Task<IActionResult> ChangeTariff([FromBody] ChangeTariffDto tariffDto)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var currentUser = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var deactivateQuery = @"
            UPDATE user_subscriptions 
            SET is_active = false, 
                updated_at = NOW() 
            WHERE user_id = @UserId 
            AND is_active = true
            AND deleted_at IS NULL";

                await connection.ExecuteAsync(deactivateQuery, new { UserId = userGuid }, transaction);

                if (tariffDto.TariffId.HasValue)
                {
                    var tariffInfoQuery = "SELECT price FROM tariffs WHERE id = @TariffId AND deleted_at IS NULL";
                    var tariffPrice = await connection.ExecuteScalarAsync<decimal>(tariffInfoQuery,
                        new { TariffId = tariffDto.TariffId.Value }, transaction);

                    var insertQuery = @"
                INSERT INTO user_subscriptions 
                    (user_id, tariff_id, start_date, end_date, is_active, created_at)
                VALUES 
                    (@UserId, @TariffId, NOW(), NOW() + INTERVAL '30 days', true, NOW())";

                    await connection.ExecuteAsync(insertQuery, new
                    {
                        UserId = userGuid,
                        TariffId = tariffDto.TariffId.Value
                    }, transaction);
                }

                await transaction.CommitAsync();
                return Ok(new { Message = "Тариф успешно изменен" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error changing tariff: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }


        [HttpPut]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updateDto)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var currentUser = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                var updateQuery = "UPDATE users SET ";
                var parameters = new DynamicParameters();
                parameters.Add("UserId", userGuid);
                parameters.Add("UpdatedAt", DateTime.UtcNow);

                if (!string.IsNullOrEmpty(updateDto.Name))
                {
                    updateQuery += "name = @Name, ";
                    parameters.Add("Name", updateDto.Name);
                }

                updateQuery = updateQuery.TrimEnd(',', ' ') + " WHERE id = @UserId AND deleted_at IS NULL";

                var affectedRows = await connection.ExecuteAsync(updateQuery, parameters, transaction);

                if (affectedRows == 0)
                {
                    return NotFound(new { Message = "Пользователь не найден" });
                }

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error updating user: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }
    }

    public class ChangeTariffDto
    {
        public int? TariffId { get; set; }
    }

    public class TariffDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int MaxPets { get; set; }
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string LogoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Role { get; set; }
        public bool HasPaidTariff { get; set; }
    }

    public class TariffInfoDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int MaxPets { get; set; }
        public int CurrentPets { get; set; }
    }

    public class UpdateUserDto
    {
        public string Name { get; set; }
    }

}