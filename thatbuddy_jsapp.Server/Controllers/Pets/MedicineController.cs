using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Controllers.Families;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineController(IConfiguration configuration, TokenService tokenService, DatabaseService databaseService) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        #region Лекарства
        [HttpPost("upsert-medicine")]
        public async Task<IActionResult> UpsertMedicine([FromBody] MedicineUpsertDto medicineDto)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = "Invalid or missing token" });

            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(medicineDto.PetId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != userGuid)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(medicineDto.PetId, (Guid)userGuid);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                if (medicineDto.Id.HasValue) // Редактирование
                {
                    var sql = @"UPDATE medicines 
                SET name = @Name,
                    dosage = @Dosage,
                    description = @Description,
                    pet_id = @PetId,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = @Id AND pet_id = @PetId";

                    await connection.ExecuteAsync(sql, medicineDto);
                    return Ok(new { Id = medicineDto.Id });
                }
                else // Создание
                {
                    var sql = @"INSERT INTO medicines 
                (name, description, dosage, pet_id)
              VALUES (@Name, @Description, @Dosage, @PetId)
              RETURNING id";

                    var medicineId = await connection.ExecuteScalarAsync<int>(sql, medicineDto);
                    return Ok(new { Id = medicineId });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error upserting medicine: {ex.Message}");
                return StatusCode(500, "Error saving medicine");
            }
        }

        [HttpGet("get-medicines/{petId}")]
        public async Task<IActionResult> GetMedicines(int petId)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = "Invalid or missing token" });

            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != userGuid)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, (Guid)userGuid);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
            }
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                var medicines = await connection.QueryAsync<MedicineResponse>(
                    "SELECT * FROM medicines WHERE pet_id = @PetId AND deleted_at IS NULL",
                    new { PetId = petId });

                return Ok(medicines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting medicines: {ex.Message}");
                return StatusCode(500, "Error getting medicines");
            }
        }
        #endregion

        #region Отслеживание приема лекарств
        [HttpPost("upsert-tracking")]
        public async Task<IActionResult> UpsertMedicineTracking([FromBody] MedicineTrackingUpsertDto trackingDto)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = "Invalid or missing token" });

           
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                var medicine = await connection.QueryFirstOrDefaultAsync(
                  @"SELECT 1 FROM medicines m
                    JOIN pets p ON m.pet_id = p.id
                    WHERE m.id = @MedicineId 
                    AND m.deleted_at IS NULL
                    AND (
                        p.user_id = @UserId 
                        OR EXISTS (
                            SELECT 1 
                            FROM family_members fm
                            JOIN families f ON fm.family_id = f.id
                            WHERE fm.user_id = p.user_id
                            AND f.owner_id = @UserId
                            AND fm.deleted_at IS NULL
                            AND f.deleted_at IS NULL
                        )
                    )",
                new { trackingDto.MedicineId, UserId = userGuid });

                if (medicine == null)
                    return NotFound(new { Message = "Medicine not found" });

                if (trackingDto.Id.HasValue) 
                {
                    var sql = @"UPDATE medicine_tracking 
                SET status = @Status,
                    description = @Description,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = @Id AND medicine_id = @MedicineId";

                    await connection.ExecuteAsync(sql, trackingDto);
                    return Ok(new { trackingDto.Id });
                }
                else { 
                    var sql = @"INSERT INTO medicine_tracking 
                (medicine_id, status, date, description)
              VALUES (@MedicineId, @Status, @Date, @Description)
              RETURNING id";

                    var trackingId = await connection.ExecuteScalarAsync<int>(sql, trackingDto);
                    return Ok(new { Id = trackingId });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error upserting medicine tracking: {ex.Message}");
                return StatusCode(500, "Error saving medicine tracking");
            }
        }

        [HttpGet("get-tracking/{medicineId}")]
        public async Task<IActionResult> GetTracking(int medicineId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(new { Message = "Invalid or missing token" });

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            try
            {
                // Проверка прав доступа к лекарству
                var medicine = await connection.QueryFirstOrDefaultAsync(
                   @"SELECT 1 FROM medicines m
                    JOIN pets p ON m.pet_id = p.id
                    WHERE m.id = @MedicineId 
                    AND m.deleted_at IS NULL
                    AND (
                        p.user_id = @UserId 
                        OR EXISTS (
                            SELECT 1 
                            FROM family_members fm
                            JOIN families f ON fm.family_id = f.id
                            WHERE fm.user_id = p.user_id
                            AND f.owner_id = @UserId
                            AND fm.deleted_at IS NULL
                            AND f.deleted_at IS NULL
                        )
                    )",
                new { MedicineId = medicineId, UserId = userGuid });

                if (medicine == null)
                    return NotFound(new { Message = "Medicine not found" });

                var sql = @"SELECT mt.id AS Id,
                           mt.medicine_id AS MedicineId,
                           mt.date as Date,
                           mt.status AS Status,
                           mt.description AS Description,
                           mt.created_at AS CreatedAt,
                           m.name AS MedicineName
                    FROM medicine_tracking mt
                    JOIN medicines m ON mt.medicine_id = m.id
                    WHERE mt.medicine_id = @MedicineId
                      AND mt.deleted_at IS NULL";

                if (fromDate.HasValue)
                    sql += " AND mt.date >= @FromDate";
                if (toDate.HasValue)
                    sql += " AND mt.date <= @ToDate";

                sql += " ORDER BY mt.date DESC";

                var tracking = await connection.QueryAsync<MedicineTrackingResponse>(sql, new
                {
                    MedicineId = medicineId,
                    FromDate = fromDate,
                    ToDate = toDate
                });

                return Ok(tracking);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting medicine tracking: {ex.Message}");
                return StatusCode(500, "Error getting medicine tracking");
            }
        }
        #endregion

        // Обновленные DTO модели
        public class MedicineUpsertDto
        {
            public int? Id { get; set; }
            public int PetId { get; set; } // Добавлено привязка к питомцу
            public string Name { get; set; }
            public string Dosage { get; set; }
            public string Description { get; set; }
        }

        public class MedicineTrackingUpsertDto
        {
            public int? Id { get; set; }
            public int MedicineId { get; set; } // Теперь только medicine_id без pet_id
            public int Status { get; set; }
            public DateTime Date { get; set; }
            public string? Description { get; set; }
        }

        public class MedicineResponse
        {
            public int Id { get; set; }
            public int PetId { get; set; } // Добавлено
            public string Name { get; set; }
            public string Description { get; set; }
            public string Dosage { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class MedicineTrackingResponse
        {
            public int Id { get; set; }
            public int MedicineId { get; set; }
            public DateTime Date { get; set; }
            public int Status { get; set; }
            public string Description { get; set; }
            public DateTime CreatedAt { get; set; }
            public string MedicineName { get; set; }
        }
    }
}
