using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Families
{
    [ApiController]
    [Route("api/[controller]")]
    public class FamilyController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        /// <summary>
        /// Добавление члена семьи
        /// </summary>
        /// <param name="request">Запрос с коротким именем пользователя</param>
        /// <returns>Результат операции</returns>
        [HttpPost("add-member")]
        public async Task<IActionResult> AddFamilyMember([FromBody] AddFamilyMemberRequest request)
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

            #region Проверка активной подписки
            var hasActiveSubscription = await HasActivePaidSubscription(currentUser.Id);
            if (!hasActiveSubscription)
            {
                return BadRequest(new { Message = "Для добавления членов семьи необходим платный тариф" });
            }
            #endregion

            #region Проверка короткого имени
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { Message = "Укажите email пользователя" });
            }

            var targetUser = await _databaseService.GetUserByEmailAsync(request.Email);
            if (targetUser == null)
            {
                return NotFound(new { Message = "Пользователь с указанным именем не найден" });
            }

            if (targetUser.Id == currentUser.Id)
            {
                return BadRequest(new { Message = "Нельзя добавить себя в семью" });
            }
            #endregion

            #region Получение или создание семьи
            var family = await GetOrCreateFamily(currentUser.Id);
            if (family == null)
            {
                return StatusCode(500, new { Message = "Ошибка при работе с семьей" });
            }
            #endregion

            #region Проверка максимального количества членов семьи
            var membersCount = await CountFamilyMembers(family.Id);
            var maxMembers = await GetMaxFamilyMembers(currentUser.Id);

            if (membersCount >= maxMembers)
            {
                return BadRequest(new { Message = $"Достигнуто максимальное количество членов семьи для вашего тарифа ({maxMembers})" });
            }
            #endregion

            #region Добавление члена семьи
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();
            try
            {
                var insertQuery = @"
                            INSERT INTO family_members (family_id, user_id, email, created_at)
                            VALUES (@FamilyId, @UserId, @Email, NOW())
                            ON CONFLICT (family_id, user_id) DO NOTHING;";

                var affectedRows = await connection.ExecuteAsync(insertQuery, new
                {
                    FamilyId = family.Id,
                    UserId = targetUser.Id,
                    ShortName = request.Email
                }, transaction);

                if (affectedRows == 0)
                {
                    return BadRequest(new { Message = "Пользователь уже является членом вашей семьи" });
                }

                await transaction.CommitAsync();
                return Ok(new { Message = "Пользователь успешно добавлен в семью" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error adding family member: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
            #endregion
        }

        /// <summary>
        /// Получение списка членов семьи
        /// </summary>
        /// <returns>Список членов семьи</returns>
        [HttpGet("members")]
        public async Task<IActionResult> GetFamilyMembers()
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = "Invalid or missing token" });
            }

            var currentUser = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (currentUser == null)
            {
                return Unauthorized(new { Message = "Invalid or missing token" });
            }
            #endregion

            #region Получение семьи пользователя
            var family = await GetOrCreateFamily((Guid)userGuid);
            if (family == null)
            {
                return StatusCode(500, new { Message = "Ошибка при работе с семьей" });
            }
            #endregion

            #region Получение членов семьи
            using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                var query = @"
                SELECT 
                    u.id as UserId,
                    u.email as Email,
                    u.name as Name
                FROM family_members fm
                JOIN users u ON fm.user_id = u.id
                WHERE fm.family_id = @FamilyId
                AND fm.deleted_at IS NULL
                AND u.deleted_at IS NULL
                ORDER BY fm.created_at DESC;";

                var members = await connection.QueryAsync<FamilyMemberDto>(query, new { FamilyId = family.Id });
                return Ok(members);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting family members: {ex.Message}");
                return StatusCode(500, new { Message = "Ошибка при получении списка семьи" });
            }
            #endregion
        }


        /// <summary>
        /// Проверка принадлежности питомца семье пользователя
        /// </summary>
        /// <param name="petId">ID питомца</param>
        /// <param name="userId">ID пользователя</param>
        /// <returns>True если питомец принадлежит семье пользователя</returns>
        public async Task<bool> IsPetBelongsToFamily(long petId, Guid userId)
        {
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                var query = @"
                    SELECT COUNT(*) 
                    FROM pets p
                    JOIN family_members fm ON p.user_id = fm.user_id
                    JOIN families f ON fm.family_id = f.id
                    WHERE p.id = @PetId 
                    AND f.owner_id = @UserId
                    AND p.deleted_at IS NULL
                    AND fm.deleted_at IS NULL
                    AND f.deleted_at IS NULL;";

                var count = await connection.ExecuteScalarAsync<int>(query, new { PetId = petId, UserId = userId });
                return count > 0;
            }
        }

        #region Вспомогательные методы
        private async Task<bool> HasActivePaidSubscription(Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var query = @"
                    SELECT COUNT(*) 
                    FROM user_subscriptions us
                    JOIN tariffs t ON us.tariff_id = t.id
                    WHERE us.user_id = @UserId
                    AND us.is_active = TRUE
                    AND us.end_date > NOW()
                    AND t.price > 0
                    AND us.deleted_at IS NULL
                    AND t.deleted_at IS NULL;";

            var count = await connection.ExecuteScalarAsync<int>(query, new { UserId = userId });
            return count > 0;
        }

        private async Task<FamilyModel?> GetOrCreateFamily(Guid ownerId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var query = "SELECT id, owner_id, name FROM families WHERE owner_id = @OwnerId AND deleted_at IS NULL;";
            var family = await connection.QueryFirstOrDefaultAsync<FamilyModel>(query, new { OwnerId = ownerId });

            if (family != null)
            {
                return family;
            }

            // Создаем новую семью, если не найдена
            var insertQuery = @"
                    INSERT INTO families (owner_id, created_at)
                    VALUES (@OwnerId, NOW())
                    RETURNING id, owner_id, name;";

            family = await connection.QueryFirstOrDefaultAsync<FamilyModel>(insertQuery, new { OwnerId = ownerId });
            return family;
        }

        private async Task<int> CountFamilyMembers(int familyId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var query = "SELECT COUNT(*) FROM family_members WHERE family_id = @FamilyId AND deleted_at IS NULL;";
            return await connection.ExecuteScalarAsync<int>(query, new { FamilyId = familyId });
        }

        private async Task<int> GetMaxFamilyMembers(Guid userId)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            var query = @"
                    SELECT t.max_family_members 
                    FROM user_subscriptions us
                    JOIN tariffs t ON us.tariff_id = t.id
                    WHERE us.user_id = @UserId
                    AND us.is_active = TRUE
                    AND us.end_date > NOW()
                    AND us.deleted_at IS NULL
                    AND t.deleted_at IS NULL
                    ORDER BY us.end_date DESC
                    LIMIT 1;";

            var result = await connection.ExecuteScalarAsync<int?>(query, new { UserId = userId });
            return result ?? 1; // Минимум 1 член семьи (сам пользователь)
        }
        #endregion
    }

    public class AddFamilyMemberRequest
    {
        public required string Email { get; set; }
    }

    public class FamilyModel
    {
        public int Id { get; set; }
        public Guid OwnerId { get; set; }
        public string? Name { get; set; }
    }

    public class FamilyMemberDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public DateTime AddedDate { get; set; }
    }
}