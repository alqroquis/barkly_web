using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationsController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        /// <summary>
        /// Добавление прививки
        /// </summary>
        /// <param name="vaccination">Объект из тела запроса</param>
        /// <param name="petId">Ид питомца</param>
        /// <returns>Ид созданной записи</returns>
        [HttpPost("add/{petId}")]
        public async Task<IActionResult> Add([FromBody] Vaccination vaccination, long petId)
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
                                  INSERT INTO vaccinations(
	                                 name, description, pet_id, vaccination_date, created_at, updated_at)
	                              VALUES (@Name, @Description, @PetId, @VaccinationDate, now(), now())
                                  RETURNING id;";
                try
                {
                    var id = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        PetId = petId,
                        vaccination.Name,
                        vaccination.Description,
                        vaccination.VaccinationDate
                    });

                    return Ok(new
                    {
                        Id = id
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding vaccination: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Вывод списка вакцинаций питомца
        /// </summary>
        /// <param name="petId">Ид питомца</param>
        /// <param name="query">Поисковый запрос</param>
        /// <param name="page">Страница</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список вакцинаций с параметрами пагинации</returns>
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
                                  select v.id as Id, 
                                         v.description as Description, 
                                         v.name as Name,
                                         v.vaccination_date as VaccinationDate, 
                                         v.created_at as CreatedAt, 
                                         v.updated_at as UpdatedAt
                                   from vaccinations v
                                   where pet_id = @PetId and 
                                         deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)
                                   limit @limit
                                   offset @offset;";
                try
                {
                    var list = await connection.QueryAsync<VaccinationList>(insertQuery, new
                    {
                        PetId = petId,
                        limit,
                        offset,
                        query = $"%{query}%"
                    });
                    var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM vaccinations
                                    WHERE pet_id = @PetId and 
                                          deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)";
                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { PetId = petId, query = $"%{query}%" });

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Vaccinations = list
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error list vaccinations: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Удаление записи о прививке
        /// </summary>
        /// <param name="vaccinationId">Ид прививки</param>
        /// <returns>Сообщение об успехе действия</returns>
        [HttpDelete("delete/{vaccinationId}")]
        public async Task<IActionResult> Delete(long vaccinationId)
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
                                  select v.id, p.user_id 
                                  from vaccinations v
                                  join pets p on v.pet_id = p.id
                                  where v.id = @VaccinationId";

                var injuryInfo = await connection.QueryFirstOrDefaultAsync<(long, Guid)>(checkQuery, new { VaccinationId = vaccinationId });

                if (injuryInfo == default || injuryInfo.Item2 != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Удаление записи о прививки
                var deleteQuery = @"update vaccinations
                                    set deleted_at = now()
                                    where id = @VaccinationId
                                          and deleted_at is null;";
                try
                {
                    var affectedRows = await connection.ExecuteAsync(deleteQuery, new { VaccinationId = vaccinationId });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting vaccination: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
                #endregion
            }
        }

    }


    /// <summary>
    /// Модель прививки
    /// </summary>
    public class Vaccination
    {
        public string? Description { get; set; }
        public string? Name { get; set; }
        public DateTime VaccinationDate { get; set; }
    }


    /// <summary>
    /// Модель прививки для вывода списка
    /// </summary>
    public class VaccinationList : Vaccination
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
