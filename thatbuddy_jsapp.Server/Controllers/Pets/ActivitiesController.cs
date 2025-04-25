using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        [HttpPost("add-activity")]
        public async Task<IActionResult> AddActivity([FromBody] PetActivityDto activityDto)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null) return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(activityDto.PetId);
            if (pet == null || pet.UserId != userGuid)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion

            try
            {
                var sql = @"INSERT INTO pet_activities 
                    (pet_id, activity_type_id, duration_minutes, distance_km, description)
                  VALUES (@PetId, @ActivityTypeId, @DurationMinutes, @DistanceKm, @Description)
                  RETURNING id";
                var activityId = await connection.ExecuteScalarAsync<long>(sql, activityDto);

                return Ok(new { Id = activityId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating pet: {ex.Message}");
                return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
            }
        }


        [HttpGet("get-activities/{petId}")]
        public async Task<IActionResult> GetActivities(long petId,
                                                       [FromQuery] DateTime? fromDate,
                                                       [FromQuery] DateTime? toDate,
                                                       [FromQuery] int? activityTypeId) 
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });

            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != userGuid) 
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                        SELECT 
                            pa.id AS Id,
                            pa.pet_id AS PetId,
                            pa.activity_type_id AS ActivityTypeId,
                            pa.duration_minutes AS DurationMinutes,
                            pa.distance_km AS DistanceKm,
                            pa.description AS Description,
                            pa.created_at AS CreatedAt,
                            at.name AS ActivityTypeName
                        FROM 
                            pet_activities pa
                        JOIN 
                            activity_types at ON pa.activity_type_id = at.id
                        WHERE 
                            pa.pet_id = @PetId";


            if (fromDate.HasValue)
                sql += " AND pa.created_at >= @FromDate";

            if (toDate.HasValue)
                sql += " AND pa.created_at <= @ToDate";

            if (activityTypeId.HasValue)
                sql += " AND pa.activity_type_id = @ActivityTypeId";

            sql += " ORDER BY pa.created_at DESC";

            try
            {
                var activities = await connection.QueryAsync(sql, new
                {
                    PetId = petId,
                    FromDate = fromDate,
                    ToDate = toDate,
                    ActivityTypeId = activityTypeId
                });

                return Ok(activities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating pet: {ex.Message}");
                return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
            }
        }


        [HttpPost("add-weight")]
        public async Task<IActionResult> AddWeightMeasurement([FromBody] WeightMeasurementDto weightDto)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });

            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(weightDto.PetId);
            if (pet == null || pet.UserId != userGuid)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                var sql = @"INSERT INTO weight_measurements 
                        (pet_id, weight_kg)
                      VALUES (@PetId, @WeightKg)
                      RETURNING id";

                var measurementId = await connection.ExecuteScalarAsync<long>(sql, new
                {
                    weightDto.PetId,
                    weightDto.WeightKg
                });

                return Ok(new { Id = measurementId });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding weight measurement: {ex.Message}");
                return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
            }
        }


        [HttpGet("get-weight-measurements/{petId}")]
        public async Task<IActionResult> GetWeightMeasurements(long petId,
                                                             [FromQuery] DateTime? fromDate,
                                                             [FromQuery] DateTime? toDate)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });

            #region Проверка принадлежности питомца пользователю
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != userGuid)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
            SELECT 
                id AS Id,
                pet_id AS PetId,
                weight_kg AS WeightKg,
                created_at AS CreatedAt
            FROM 
                weight_measurements
            WHERE 
                pet_id = @PetId";

            if (fromDate.HasValue)
                sql += " AND created_at >= @FromDate";

            if (toDate.HasValue)
                sql += " AND created_at <= @ToDate";

            sql += " ORDER BY created_at DESC";

            try
            {
                var measurements = await connection.QueryAsync<WeightMeasurementResponse>(sql, new
                {
                    PetId = petId,
                    FromDate = fromDate,
                    ToDate = toDate
                });

                return Ok(measurements);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting weight measurements: {ex.Message}");
                return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
            }
        }
    }

    public class PetActivityDto
    {
        /// <summary>
        /// ID питомца
        /// </summary>
        [Required]
        public int PetId { get; set; }

        /// <summary>
        /// ID типа активности 
        /// </summary>
        [Required]
        public int ActivityTypeId { get; set; }

        /// <summary>
        /// Длительность активности в минутах
        /// </summary>
        [Range(1, 1440, ErrorMessage = "Длительность должна быть от 1 до 1440 минут")]
        public int? DurationMinutes { get; set; }

        /// <summary>
        /// Пройденное расстояние в километрах
        /// </summary>
        [Range(0.01, 100, ErrorMessage = "Дистанция должна быть от 0.01 до 100 км")]
        public decimal? DistanceKm { get; set; }

        /// <summary>
        /// Дополнительные заметки
        /// </summary>
        public string? Description { get; set; }
    }


    public class PetActivityListDto
    {
        /// <summary>
        /// Длительность активности в минутах
        /// </summary>
        public int? DurationMinutes { get; set; }

        /// <summary>
        /// Пройденное расстояние в километрах
        /// </summary>
        [Range(0.01, 100, ErrorMessage = "Дистанция должна быть от 0.01 до 100 км")]
        public decimal? DistanceKm { get; set; }

        /// <summary>
        /// Дополнительные заметки
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string? ActivityTypeName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string? ActivityTypeId { get; set; }
    }

    public class WeightMeasurementDto
    {
        public long PetId { get; set; }
        public double WeightKg { get; set; }
    }


    public class WeightMeasurementResponse
    {
        public long Id { get; set; }
        public long PetId { get; set; }
        public double WeightKg { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
