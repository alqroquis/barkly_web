using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Org.BouncyCastle.Asn1.Ocsp;
using System.Text.Json;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Reminders
{
    [ApiController]
    [Route("api/[controller]")]
    public class RemindersController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        /// <summary>
        /// Добавление напоминания
        /// </summary>
        /// <param name="reminder">Объект напоминания из тела запроса</param>
        /// <returns>Ид созданного напоминания</returns>
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] Reminder reminder)
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

            #region Валидация полей
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (reminder.EndTime.HasValue && reminder.EndTime <= reminder.StartTime)
            {
                return BadRequest(new { Message = "End time must be after start time" });
            }
            #endregion

            #region Добавление напоминания
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var insertQuery = @"
                INSERT INTO reminders(
                    title, description, start_time, end_time, date, 
                    importance_level, category_id, user_id)
                VALUES (@Title, @Description, @StartTime, @EndTime, @Date, 
                    @ImportanceLevel, @CategoryId, @UserId)
                RETURNING id;";

                try
                {
                    var id = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        reminder.Title,
                        reminder.Description,
                        reminder.StartTime,
                        reminder.EndTime,
                        reminder.Date?.Date,
                        reminder.ImportanceLevel,
                        reminder.CategoryId,
                        UserId = user.Id
                    });

                    return Ok(new { Id = id });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding reminder: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }

        /// <summary>
        /// Получение списка напоминаний пользователя
        /// </summary>
        /// <param name="startDate">Начальная дата периода</param>
        /// <param name="endDate">Конечная дата периода</param>
        /// <param name="categoryId">Фильтр по категории</param>
        /// <param name="importanceLevel">Фильтр по важности</param>
        /// <param name="page">Страница</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список напоминаний с параметрами пагинации</returns>
        [HttpGet("list")]
        public async Task<IActionResult> List(
            DateTime? startDate = null,
            DateTime? endDate = null,
            long? categoryId = null,
            int? importanceLevel = null,
            int page = 1,
            int limit = 40)
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

            #region Настройка параметров
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 40;
            }

            if (!startDate.HasValue) startDate = DateTime.Today;
            if (!endDate.HasValue) endDate = startDate.Value.AddDays(7);
            #endregion

            #region Получение списка
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                int offset = (page - 1) * limit;

                var query = @"
                SELECT r.id as Id, 
                       r.title as Title, 
                       r.description as Description,
                       r.start_time as StartTime, 
                       r.end_time as EndTime,
                       r.date as Date,
                       r.importance_level as ImportanceLevel,
                       r.category_id as CategoryId,
                       rc.name as CategoryName,
                       rc.color as CategoryColor,
                       r.created_at as CreatedAt, 
                       r.updated_at as UpdatedAt
                FROM reminders r
                LEFT JOIN reminder_categories rc ON r.category_id = rc.id
                WHERE r.user_id = @UserId 
                      AND r.deleted_at IS NULL
                      AND r.date BETWEEN @StartDate AND @EndDate
                      AND (@CategoryId IS NULL OR r.category_id = @CategoryId)
                      AND (@ImportanceLevel IS NULL OR r.importance_level = @ImportanceLevel)
                ORDER BY r.date, r.start_time
                LIMIT @Limit
                OFFSET @Offset;";

                var countQuery = @"
                SELECT COUNT(*)
                FROM reminders
                WHERE user_id = @UserId 
                      AND deleted_at IS NULL
                      AND date BETWEEN @StartDate AND @EndDate
                      AND (@CategoryId IS NULL OR category_id = @CategoryId)
                      AND (@ImportanceLevel IS NULL OR importance_level = @ImportanceLevel);";

                try
                {
                    var reminders = await connection.QueryAsync<ReminderList>(query, new
                    {
                        UserId = user.Id,
                        StartDate = startDate,
                        EndDate = endDate,
                        CategoryId = categoryId,
                        ImportanceLevel = importanceLevel,
                        Limit = limit,
                        Offset = offset
                    });

                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new
                    {
                        UserId = user.Id,
                        StartDate = startDate,
                        EndDate = endDate,
                        CategoryId = categoryId,
                        ImportanceLevel = importanceLevel
                    });

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Reminders = reminders
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting reminders list: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }

        /// <summary>
        /// Редактирование напоминания (частичное обновление)
        /// </summary>
        /// <param name="reminderId">Ид напоминания</param>
        /// <param name="reminderUpdates">Обновленные данные (только изменяемые поля)</param>
        /// <returns>Сообщение об успехе</returns>
        [HttpPut("update/{reminderId}")]
        public async Task<IActionResult> Update(long reminderId, [FromBody] JsonElement reminderUpdates)
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

            #region Проверка принадлежности напоминания пользователю
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var checkQuery = "SELECT user_id FROM reminders WHERE id = @ReminderId AND deleted_at IS NULL";
                var reminderUserId = await connection.ExecuteScalarAsync<Guid?>(checkQuery, new { ReminderId = reminderId });

                if (reminderUserId == null || reminderUserId.Value != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Построение динамического SQL запроса
                var updateFields = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", reminderId);
                parameters.Add("UserId", user.Id);

                // Проверяем каждое поле в JSON
                if (reminderUpdates.TryGetProperty("title", out var titleProp))
                {
                    var title = titleProp.GetString();
                    if (!string.IsNullOrEmpty(title))
                    {
                        updateFields.Add("title = @Title");
                        parameters.Add("Title", title);
                    }
                }

                if (reminderUpdates.TryGetProperty("description", out var descProp))
                {
                    updateFields.Add("description = @Description");
                    parameters.Add("Description", descProp.GetString());
                }

                if (reminderUpdates.TryGetProperty("startTime", out var startTimeProp))
                {
                    if (startTimeProp.ValueKind == JsonValueKind.String &&
                        TimeSpan.TryParse(startTimeProp.GetString(), out var startTime))
                    {
                        updateFields.Add("start_time = @StartTime");
                        parameters.Add("StartTime", startTime);
                    }
                    else if (startTimeProp.ValueKind == JsonValueKind.Number)
                    {
                        updateFields.Add("start_time = @StartTime");
                        parameters.Add("StartTime", TimeSpan.FromMilliseconds(startTimeProp.GetInt64()));
                    }
                }

                if (reminderUpdates.TryGetProperty("endTime", out var endTimeProp))
                {
                    if (endTimeProp.ValueKind == JsonValueKind.Null)
                    {
                        updateFields.Add("end_time = NULL");
                    }
                    else if (endTimeProp.ValueKind == JsonValueKind.String &&
                             TimeSpan.TryParse(endTimeProp.GetString(), out var endTime))
                    {
                        updateFields.Add("end_time = @EndTime");
                        parameters.Add("EndTime", endTime);
                    }
                    else if (endTimeProp.ValueKind == JsonValueKind.Number)
                    {
                        updateFields.Add("end_time = @EndTime");
                        parameters.Add("EndTime", TimeSpan.FromMilliseconds(endTimeProp.GetInt64()));
                    }
                }

                if (reminderUpdates.TryGetProperty("date", out var dateProp) &&
                    dateProp.ValueKind == JsonValueKind.String &&
                    DateTime.TryParse(dateProp.GetString(), out var date))
                {
                    updateFields.Add("date = @Date");
                    parameters.Add("Date", date.Date);
                }

                if (reminderUpdates.TryGetProperty("importanceLevel", out var importanceProp) &&
                    importanceProp.ValueKind == JsonValueKind.Number)
                {
                    updateFields.Add("importance_level = @ImportanceLevel");
                    parameters.Add("ImportanceLevel", importanceProp.GetInt32());
                }

                if (reminderUpdates.TryGetProperty("categoryId", out var categoryIdProp))
                {
                    if (categoryIdProp.ValueKind == JsonValueKind.Null)
                    {
                        updateFields.Add("category_id = NULL");
                    }
                    else if (categoryIdProp.ValueKind == JsonValueKind.Number)
                    {
                        updateFields.Add("category_id = @CategoryId");
                        parameters.Add("CategoryId", categoryIdProp.GetInt64());
                    }
                }

                // Если нет полей для обновления
                if (updateFields.Count == 0)
                {
                    return BadRequest(new { Message = "No fields to update" });
                }

                // Проверка валидности времени (если обновляются оба времени)
                if (parameters.ParameterNames.Contains("StartTime") &&
                    parameters.ParameterNames.Contains("EndTime") &&
                    parameters.Get<TimeSpan>("EndTime") <= parameters.Get<TimeSpan>("StartTime"))
                {
                    return BadRequest(new { Message = "End time must be after start time" });
                }

                // Добавляем обновление времени модификации
                updateFields.Add("updated_at = now()");

                var updateQuery = $@"
            UPDATE reminders
            SET {string.Join(", ", updateFields)}
            WHERE id = @Id AND user_id = @UserId";
                #endregion

                #region Выполнение обновления
                try
                {
                    var affectedRows = await connection.ExecuteAsync(updateQuery, parameters);

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating reminder: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
                #endregion
            }
        }

        /// <summary>
        /// Удаление напоминания
        /// </summary>
        /// <param name="reminderId">Ид напоминания</param>
        /// <returns>Сообщение об успехе</returns>
        [HttpDelete("delete/{reminderId}")]
        public async Task<IActionResult> Delete(long reminderId)
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

            #region Проверка принадлежности напоминания пользователю
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var checkQuery = "SELECT user_id FROM reminders WHERE id = @ReminderId AND deleted_at IS NULL";
                var reminderUserId = await connection.ExecuteScalarAsync<Guid?>(checkQuery, new { ReminderId = reminderId });

                if (reminderUserId == null || reminderUserId.Value != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Удаление напоминания
                var deleteQuery = @"
                UPDATE reminders
                SET deleted_at = now()
                WHERE id = @ReminderId AND user_id = @UserId";

                try
                {
                    var affectedRows = await connection.ExecuteAsync(deleteQuery, new
                    {
                        ReminderId = reminderId,
                        UserId = userGuid
                    });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting reminder: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }
    }

    // ReminderCategory.cs
    public class ReminderCategory
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Reminder.cs
    public class Reminder
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public DateTime? Date { get; set; }
        public int? ImportanceLevel { get; set; }
        public long? CategoryId { get; set; }
    }

    // ReminderList.cs (для списка)
    public class ReminderList
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public DateTime Date { get; set; }
        public int ImportanceLevel { get; set; }
        public long? CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryColor { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}