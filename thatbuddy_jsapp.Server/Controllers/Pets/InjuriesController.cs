using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class InjuriesController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        /// <summary>
        /// Добавление травмы или операции
        /// </summary>
        /// <param name="injury">Объект из тела запроса</param>
        /// <param name="petId">Ид питомца</param>
        /// <returns>Ид созданной записи</returns>
        [HttpPost("add/{petId}")]
        public async Task<IActionResult> Add([FromBody] Injury injury, long petId)
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


            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion


            #region Валидация полей
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            #endregion


            #region Добавление лекарства
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var insertQuery = @"
                                  INSERT INTO injuries(
	                                 name, description, pet_id, injury_date, created_at, updated_at)
	                              VALUES (@Name, @Description, @PetId, @InjuryDate, now(), now())
                                  RETURNING id;";
                try
                {
                    var injuryId = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        PetId = petId,
                        injury.Name,
                        injury.Description,
                        injury.InjuryDate
                    });

                    return Ok(new
                    {
                        Id = injuryId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding injury: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Вывод списка операций питомца
        /// </summary>
        /// <param name="petId">Ид питомца</param>
        /// <param name="query">Поисковый запрос</param>
        /// <param name="page">Страница</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список травм с параметрами пагинации</returns>
        [HttpGet("list/{petId}")]
        public async Task<IActionResult> List(long petId, string query = "", int page = 1, int limit = 40)
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


            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion


            #region 
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 40;
            }
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                int offset = (page - 1) * limit;
                var insertQuery = @"
                                  select i.id as Id, 
                                         i.description as Description, 
                                         i.name as Name,
                                         i.injury_date as InjuryDate, 
                                         i.created_at as CreatedAt, 
                                         i.updated_at as UpdatedAt
                                   from injuries i
                                   where pet_id = @PetId and 
                                         deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)
                                   limit @limit
                                   offset @offset;";
                try
                {
                    var injuries = await connection.QueryAsync<InjuryList>(insertQuery, new
                    {
                        PetId = petId,
                        limit,
                        offset,
                        query = $"%{query}%"
                    });
                    var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM injuries
                                    WHERE pet_id = @PetId and 
                                          deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)";
                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { PetId = petId, query = $"%{query}%" });

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Injuries = injuries
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error list injuries: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Удаление записи об операции или травме
        /// </summary>
        /// <param name="injuryId">Ид травмы</param>
        /// <returns>Сообщение об успехе действия</returns>
        [HttpDelete("delete/{injuryId}")]
        public async Task<IActionResult> Delete(long injuryId)
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

            #region Проверка принадлежности лечения пользователю
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var checkQuery = @"
                                  select i.id, p.user_id 
                                  from injuries i
                                  join pets p on i.pet_id = p.id
                                  where i.id = @InjuryId";

                var injuryInfo = await connection.QueryFirstOrDefaultAsync<(long, Guid)>(checkQuery, new { InjuryId = injuryId });

                if (injuryInfo == default || injuryInfo.Item2 != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Удаление лечения
                var deleteQuery = @"update injuries
                                    set deleted_at = now()
                                    where id = @InjuryId
                                          and deleted_at is null;";
                try
                {
                    var affectedRows = await connection.ExecuteAsync(deleteQuery, new { InjuryId = injuryId });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting injury: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
                #endregion
            }
        }
    }


    /// <summary>
    /// Модель травмы
    /// </summary>
    public class Injury
    {
        public string? Description { get; set; }
        public string? Name { get; set; }
        public DateTime InjuryDate { get; set; }
    }


    /// <summary>
    /// Модель травмы для вывода списка
    /// </summary>
    public class InjuryList : Injury
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
