using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class TreatmentsController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        /// <summary>
        /// Добавление лекарства
        /// </summary>
        /// <param name="treatment">Объект из тела запроса</param>
        /// <param name="petId">Ид питомца</param>
        /// <returns>Ид созданной записи</returns>
        [HttpPost("add/{petId}")]
        public async Task<IActionResult> AddTreatment([FromBody] Treatment treatment, long petId)
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
                                  INSERT INTO treatments(
	                                 pet_id, description, treatment_type_id, treatment_date, created_at, updated_at)
	                              VALUES (@PetId, @Description, @TreatmentTypeId, @TreatmentDate, now(), now())
                                  RETURNING id;";
                try
                {
                    var treatmentId = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        PetId = petId,
                        treatment.Description,
                        treatment.TreatmentTypeId,
                        treatment.TreatmentDate
                    });

                    return Ok(new
                    {
                        Id = treatmentId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding treatment: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Вывод списка лекарств питомца
        /// </summary>
        /// <param name="petId">Ид питомца</param>
        /// <param name="query">Поисковый запрос</param>
        /// <param name="page">Страница</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список лекарств с параметрами пагинации</returns>
        [HttpGet("list/{petId}")]
        public async Task<IActionResult> ListTreatment(long petId, string query = "", int page = 1, int limit = 40)
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
                                  select t.id as Id, 
                                         t.description as Description, 
                                         t.treatment_type_id as TreatmentTypeId,
                                         ty.name as TreatmentTypeName, 
                                         t.treatment_date as TreatmentDate, 
                                         t.created_at as CreatedAt, 
                                         t.updated_at as UpdatedAt
                                   from treatments t
                                        inner join treatment_types ty on ty.id = t.treatment_type_id
                                   where pet_id = @PetId and 
                                         deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)
                                   limit @limit
                                   offset @offset;";
                try
                {
                    var treatments = await connection.QueryAsync<TreatmentList>(insertQuery, new
                    {
                        PetId = petId,
                        limit,
                        offset,
                        query = $"%{query}%"
                    });
                    var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM treatments
                                    WHERE pet_id = @PetId and 
                                          deleted_at is NULL and 
                                         (@query = '' OR description ILIKE @query)";
                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { PetId = petId, query = $"%{query}%" });

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Treatments = treatments
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error list treatments: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Удаление записи лекарства
        /// </summary>
        /// <param name="treatmentId">Ид записи лекарства</param>
        /// <returns>Сообщение об успехе действия</returns>
        [HttpDelete("delete/{treatmentId}")]
        public async Task<IActionResult> DeleteTreatment(long treatmentId)
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
                                  select t.id, p.user_id 
                                  from treatments t
                                  join pets p on t.pet_id = p.id
                                  where t.id = @TreatmentId";

                var treatmentInfo = await connection.QueryFirstOrDefaultAsync<(long, Guid)>(checkQuery, new { TreatmentId = treatmentId });

                if (treatmentInfo == default || treatmentInfo.Item2 != user.Id)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                }
                #endregion

                #region Удаление лечения
                var deleteQuery = @"update treatments
                                    set deleted_at = now()
                                    where id = @TreatmentId
                                          and deleted_at is null;";
                try
                {
                    var affectedRows = await connection.ExecuteAsync(deleteQuery, new { TreatmentId = treatmentId });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.NotFound) });
                    }

                    return Ok(new { Message = MessageHelper.GetMessageText(Messages.Success) });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting treatment: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
                #endregion
            }
        }
    }


    /// <summary>
    /// Модель записи о лечении
    /// </summary>
    public class Treatment
    {
        public string? Description { get; set; }
        public int TreatmentTypeId { get; set; }
        public DateTime TreatmentDate { get; set; }
    }


    /// <summary>
    /// Модель записи о лечении для вывода в список
    /// </summary>
    public class TreatmentList : Treatment
    {
        public long Id { get; set; }
        public string? TreatmentTypeName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
