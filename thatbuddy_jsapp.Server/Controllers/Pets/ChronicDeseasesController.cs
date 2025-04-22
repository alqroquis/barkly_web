using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChronicDiseasesController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        /// <summary>
        /// Добавление заболевания
        /// </summary>
        /// <param name="disease">Объект из тела запроса</param>
        /// <param name="petId">Ид питомца</param>
        /// <returns>Ид созданной записи</returns>
        [HttpPost("add/{petId}")]
        public async Task<IActionResult> Add([FromBody] Disease disease, long petId)
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


            #region Добавление 
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var insertQuery = @"
                                  INSERT INTO chronic_diseases(
	                                 name, description, pet_id, created_at, updated_at)
	                              VALUES (@Name, @Description, @PetId, now(), now())
                                  RETURNING id;";
                try
                {
                    var id = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        PetId = petId,
                        disease.Name,
                        disease.Description
                    });

                    return Ok(new
                    {
                        Id = id
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding diseas: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Вывод списка заболеваний питомца
        /// </summary>
        /// <param name="petId">Ид питомца</param>
        /// <param name="query">Поисковый запрос</param>
        /// <param name="page">Страница</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список заболеваний с параметрами пагинации</returns>
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
                                  select d.id as Id, 
                                         d.description as Description, 
                                         d.name as Name,
                                         d.created_at as CreatedAt, 
                                         d.updated_at as UpdatedAt
                                   from chronic_diseases d
                                   where pet_id = @PetId and 
                                         deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)
                                   limit @limit
                                   offset @offset;";
                try
                {
                    var diseases = await connection.QueryAsync<DiseasesList>(insertQuery, new
                    {
                        PetId = petId,
                        limit,
                        offset,
                        query = $"%{query}%"
                    });
                    var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM chronic_diseases
                                    WHERE pet_id = @PetId and 
                                          deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)";
                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { PetId = petId, query = $"%{query}%" });

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Diseases = diseases
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error list diseases: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Удаление записи о заболевании
        /// </summary>
        /// <param name="diseasId">Ид заболевания</param>
        /// <returns>Сообщение об успехе действия</returns>
        [HttpDelete("delete/{diseasId}")]
        public async Task<IActionResult> Delete(long diseasId)
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
                                  select d.id, p.user_id 
                                  from chronic_diseases d
                                  join pets p on d.pet_id = p.id
                                  where d.id = @DiseasId";

                var injuryInfo = await connection.QueryFirstOrDefaultAsync<(long, Guid)>(checkQuery, new { DiseasId = diseasId });

                if (injuryInfo == default || injuryInfo.Item2 != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Удаление лечения
                var deleteQuery = @"update chronic_diseases
                                    set deleted_at = now()
                                    where id = @DiseasId
                                          and deleted_at is null;";
                try
                {
                    var affectedRows = await connection.ExecuteAsync(deleteQuery, new { DiseasId = diseasId });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting disease: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
                #endregion
            }
        }
    }


    /// <summary>
    /// Модель заболевания
    /// </summary>
    public class Disease
    {
        public string? Description { get; set; }
        public string? Name { get; set; }
    }


    /// <summary>
    /// Модель заболевания для вывода списка
    /// </summary>
    public class DiseasesList : Disease
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}