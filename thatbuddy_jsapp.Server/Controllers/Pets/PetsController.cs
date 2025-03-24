using Dapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Text;
using System.Xml.Linq;
using thatbuddy_jsapp.Server.Models.Pets;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Pets
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        /// <summary> 
        /// Добавление питомца
        /// </summary>
        /// <param name="pet">Объект из тела запроса</param>
        /// <returns>Возврщает Id созданного питомца</returns>
        [HttpPost("add")]
        public async Task<IActionResult> AddPet([FromBody] Pet pet)
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

            if (pet.Name == string.Empty)
            {
                return BadRequest(new { Message = "Укажите кличку питомца." });
            }

            if (pet.BirthDate == null && pet.BirthDate > DateTime.UtcNow)
            {
                return BadRequest(new { Message = "Укажите дату рождения питомца." });
            }
            #endregion


            var countQuery = "SELECT COUNT(*) FROM pets WHERE user_id = @UserId and deleted_at is NULL";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                int petCount = await connection.ExecuteScalarAsync<int>(countQuery, new { pet.UserId });
                if (petCount >= 10)
                {
                    return BadRequest(MessageHelper.GetMessageText(Messages.TooManyPetsForUser));
                }

                var insertQuery = @"
            INSERT INTO pets (breed_id, birth_date, logo_url, name, stigma, microchip, description, user_id, created_at)
            VALUES (@BreedId, @BirthDate, @LogoUrl, @Name, @Stigma, @Microchip, @Description, @UserId, now())
            RETURNING id;"; 

                try
                {
                    var petId = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        BreedId = pet.BreedId,
                        BirthDate = pet.BirthDate,
                        LogoUrl = pet.LogoUrl,
                        Name = pet.Name,
                        Stigma = pet.Stigma,
                        Microchip = pet.Microchip,
                        Description = pet.Description,
                        UserId = user.Id
                    });

                    return Ok(new
                    {
                        Id = petId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding pet: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
        }


        /// <summary>
        /// Редактирование записи питомца
        /// </summary>
        /// <param name="petId">Id питомца</param>
        /// <param name="petUpdate">Объект из тела запроса</param>
        [HttpPut("edit/{petId}")]
        public async Task<IActionResult> EditPet(long petId, [FromBody] PetUpdateDto petUpdate)
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
            var pet = await GetPetByIdAsync(petId);
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


            #region Обновление данных питомца
            var updateQuery = new StringBuilder("UPDATE pets SET ");
            var parameters = new DynamicParameters();
            parameters.Add("Id", petId);
            parameters.Add("UserId", user.Id);

            if (petUpdate.Name != null)
            {
                updateQuery.Append("name = @Name, ");
                parameters.Add("Name", petUpdate.Name);
            }

            if (petUpdate.Description != null)
            {
                updateQuery.Append("description = @Description, ");
                parameters.Add("Description", petUpdate.Description);
            }

            if (petUpdate.BreedId != null)
            {
                updateQuery.Append("breed_id = @BreedId, ");
                parameters.Add("BreedId", petUpdate.BreedId);
            }

            if (petUpdate.BirthDate != null)
            {
                updateQuery.Append("birth_date = @BirthDate, ");
                parameters.Add("BirthDate", petUpdate.BirthDate);
            }

            if (petUpdate.Stigma != null)
            {
                updateQuery.Append("stigma = @Stigma, ");
                parameters.Add("Stigma", petUpdate.Stigma);
            }

            if (petUpdate.Microchip != null)
            {
                updateQuery.Append("microchip = @Microchip, ");
                parameters.Add("Microchip", petUpdate.Microchip);
            }

            if (updateQuery.Length > 0)
            {
                updateQuery.Length -= 2;
            }

            updateQuery.Append(" WHERE id = @Id AND user_id = @UserId AND deleted_at IS NULL;");

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var affectedRows = await connection.ExecuteAsync(updateQuery.ToString(), parameters);

                    if (affectedRows == 0)
                    {
                        return NotFound(MessageHelper.GetMessageText(Messages.PetNotFound));
                    }

                    return Ok(new { Message = "Питомец успешно обновлен." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating pet: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Получение формы питомца
        /// </summary>
        /// <param name="petId">Id питомца</param>
        [HttpGet("get/{petId}")]
        public async Task<IActionResult> GetPet(long petId)
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


            #region Получение информации о питомце
            var query = @"
                        SELECT 
                            p.id AS PetId,
                            p.name AS PetName,
                            p.description AS PetDescription,
                            p.birth_date AS PetBirthDate,
                            p.stigma AS PetStigma,
                            p.microchip AS PetMicrochip,
                            p.breed_id as BreedId,
                            b.name AS BreedName,
                            p.user_id as UserId,
                            u.name AS UserName
                        FROM 
                            pets p
                            LEFT JOIN breeds b ON p.breed_id = b.id
                            JOIN users u ON p.user_id = u.id
                        WHERE 
                            p.id = @PetId 
                            AND p.deleted_at IS NULL;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var petInfo = await connection.QueryFirstOrDefaultAsync<PetInfo>(query, new { PetId = petId });

                    if (petInfo == null)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                    }
                    if (petInfo.UserName != user.Name)
                    {
                        return BadRequest(new { Message = MessageHelper.GetMessageText(Messages.AccessDenied) });
                    }

                    return Ok(new
                    {
                        Id = petInfo.PetId,
                        Name = petInfo.PetName,
                        Breed = new
                        {
                            Id = petInfo.BreedId,
                            Name = petInfo.BreedName
                        },
                        User = new
                        {
                            Id = petInfo.UserId,
                            Name = petInfo.UserName
                        },
                        Stigma = petInfo.PetStigma,
                        Microchip = petInfo.PetMicrochip,
                        Birthdate = petInfo.PetBirthDate
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving pet info: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        /// <summary>
        /// Удаление питомца
        /// </summary>
        /// <param name="petId">Id питомца</param>
        [HttpDelete("delete/{petId}")]
        public async Task<IActionResult> DeletePet(long petId)
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
            var pet = await GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion


            #region Выполнение soft delete
            var query = @"
                        UPDATE pets
                        SET deleted_at = NOW()
                        WHERE id = @PetId
                          AND user_id = @UserId
                          AND deleted_at IS NULL;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var affectedRows = await connection.ExecuteAsync(query, new { PetId = petId, UserId = user.Id });

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                    }

                    return Ok(new { Message = "Питомец успешно удален." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting pet: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        /// <summary>
        /// Получение списка питомцев
        /// </summary>
        /// <returns>Список питомцев без дополнительной информации</returns>
        [HttpGet("list")]
        public async Task<IActionResult> ListPets()
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


            #region Получение списка питомцев пользователя
            var query = @"
                        SELECT 
                            p.id AS PetId,
                            p.name AS PetName
                        FROM 
                            pets p
                        WHERE 
                            p.user_id = @UserId 
                            AND p.deleted_at IS NULL;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var pets = await connection.QueryAsync<PetInfo>(query, new { UserId = user.Id });

                    if (pets == null || !pets.Any())
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetsNotFound) });
                    }

                    // Формируем упрощенный ответ с Id и Name
                    var result = pets.Select(p => new
                    {
                        Id = p.PetId,
                        Name = p.PetName
                    });

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving pets list: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        /// <summary>
        /// Создание медицинской карты
        /// </summary>
        /// <param name="medicineCard">Объект из тела запроса</param>
        /// <param name="petId">Id питомца</param>
        /// <returns>Id созданной карты</returns>
        [HttpPost("add-medicine-card/{petId}")]
        public async Task<IActionResult> AddMedicineCard([FromBody] MedicineCard medicineCard, long petId)
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
            var pet = await GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }
            #endregion


            #region Проверка существования медицинской карты
            var existingMedicineCard = await _databaseService.GetMedicineCardByPetIdAsync(petId);
            if (existingMedicineCard != null)
                return BadRequest(new { Message = "Медицинская карта питомца уже существует." });
            #endregion


            #region Валидация полей
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var insertQuery = new StringBuilder("INSERT INTO med_cards (");
            var insertValues = new StringBuilder("VALUES (");
            var parameters = new DynamicParameters();
            insertQuery.Append("pet_id, ");
            insertValues.Append("@Id, ");
            parameters.Add("Id", petId);
            if (medicineCard.Allergies != null)
            {
                insertQuery.Append("allergies, ");
                insertValues.Append("@Allergies, ");
                parameters.Add("Allergies", medicineCard.Allergies);
            }
            if (medicineCard.Weight != null)
            {
                insertQuery.Append("weight, ");
                insertValues.Append("@Weight, ");
                parameters.Add("Weight", medicineCard.Weight);
            }
            if (medicineCard.FeedTypeId != null)
            {
                insertQuery.Append("feed_type_id, ");
                insertValues.Append("@FeedTypeId, ");
                parameters.Add("FeedTypeId", medicineCard.FeedTypeId);
            }
            if (medicineCard.FeedingFrequency != null)
            {
                insertQuery.Append("feeding_frequency, ");
                insertValues.Append("@FeedingFrequency, ");
                parameters.Add("FeedingFrequency", medicineCard.FeedingFrequency);
            }
            if (medicineCard.Ingredients != null)
            {
                insertQuery.Append("ingredients, ");
                insertValues.Append("@Ingredients, ");
                parameters.Add("Ingredients", medicineCard.Ingredients);
            }
            if (medicineCard.ServingSize != null)
            {
                insertQuery.Append("serving_size, ");
                insertValues.Append("@ServingSize, ");
                parameters.Add("ServingSize", medicineCard.ServingSize);
            }
            if (medicineCard.FeaturesOfCare != null)
            {
                insertQuery.Append("features_of_care, ");
                insertValues.Append("@FeaturesOfCare, ");
                parameters.Add("FeaturesOfCare", medicineCard.FeaturesOfCare);
            }
            insertQuery.Append("created_at");
            insertValues.Append("now()");
            #endregion


            #region Добавление медицинской карты
            insertQuery.Append(") ");
            insertValues.Append(") RETURNING id;");
            var finalInsertQuery = insertQuery.ToString() + insertValues.ToString();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var medicineCardId = await connection.ExecuteScalarAsync<long>(finalInsertQuery, parameters);

                    return Ok(new
                    {
                        Id = medicineCardId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ошибка при добавлении медицинской карты: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        /// <summary>
        /// Получение формы медицинской карты
        /// </summary>
        /// <param name="petId">Id питомца</param>
        [HttpGet("get-medicine-card/{petId}")]
        public async Task<IActionResult> GetMedicineCard(long petId)
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

            #region Получение информации о питомце
            var query = @"
                        SELECT  m.id as Id, 
		                        m.pet_id as PetId, 
		                        p.name as PetName,
		                        p.user_id as UserId,
		                        u.name as UserName,
		                        m.weight as Weight, 
		                        m.allergies as Allergies, 
		                        m.feed_type_id as FeedTypeId, 
		                        f.name as FeedTypeName,
		                        m.feeding_frequency as FeedingFrequency, 
		                        m.ingredients as Ingredients, 
		                        m.serving_size as ServingSize, 
		                        m.features_of_care as FeaturesOfCare,
		                        m.created_at as CreatedAt, 
		                        m.updated_at as UpdatedAt 
                        FROM public.med_cards m
		                        inner join pets p on p.id = m.pet_id and 
							                         p.deleted_at is NULL 
		                        inner join users u on u.id = p.user_id and 
							                          u.deleted_at is NULL
		                        inner join feed_types f on f.id = m.feed_type_id
                        WHERE m.deleted_at is NULL and 
		                      m.pet_id = @PetId;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var medInfo = await connection.QueryFirstOrDefaultAsync<MedInfo>(query, new { PetId = petId });

                    if (medInfo == null)
                    {
                        return NotFound(new { Message = MessageHelper.GetMessageText(Messages.MedCardNotFound) });
                    }
                    if (medInfo.UserName != user.Name)
                    {
                        return BadRequest(new { Message = MessageHelper.GetMessageText(Messages.AccessDenied) });
                    }

                    return Ok(new
                    {
                        Id = medInfo.Id,
                        Pet = new {
                            Id = medInfo.PetId,
                            Name = medInfo.PetName
                        },
                       User = new
                       {
                           Id = medInfo.UserId,
                           Name = medInfo.UserName
                       },
                        Weight = medInfo.Weight,
                        Allergies = medInfo.Allergies,
                        FeedType = new
                        {
                            Id = medInfo.FeedTypeId,
                            Name = medInfo.FeedTypeName
                        },
                        FeedingFrequency = medInfo.FeedingFrequency,
                        Ingredients = medInfo.Ingredients,
                        ServingSize = medInfo.ServingSize,
                        FeaturesOfCare = medInfo.FeaturesOfCare,
                        CreatedAt = medInfo.CreatedAt,
                        UpdatedAt = medInfo.UpdatedAt

                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving med info: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        /// <summary>
        /// Получение питомца по Id для проверки существования записи
        /// </summary>
        /// <param name="petId">Id питомца</param>
        private async Task<Pet?> GetPetByIdAsync(long petId)
        {
            var query = "SELECT id, user_id as UserId, name, description, breed_id as BreedId, birth_date as BirthDate, stigma, microchip FROM pets WHERE id = @Id AND deleted_at IS NULL;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryFirstOrDefaultAsync<Pet>(query, new { Id = petId });
            }
        }
    }


    public class PetUpdateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? BreedId { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Stigma { get; set; }
        public string? Microchip { get; set; }
    }


    public class PetInfo
    {
        public long PetId { get; set; }
        public required string PetName { get; set; }
        public string? PetDescription { get; set; }
        public DateTime PetBirthDate { get; set; }
        public string? PetStigma { get; set; }
        public string? PetMicrochip { get; set; }
        public string? BreedName { get; set; }
        public int? BreedId { get; set; }
        public Guid UserId { get; set; }
        public required string UserName { get; set; } 
    }


    public class MedicineCard
    {
        public double? Weight { get; set; }
        public string? Allergies { get; set; }
        public short? FeedTypeId { get; set; }
        public short? FeedingFrequency { get; set; }
        public string? Ingredients { get; set; }
        public short? ServingSize { get; set; }
        public string? FeaturesOfCare { get; set; }
    }


    public class MedInfo
    {
        public long Id { get; set; }
        public long PetId { get; set; }
        public string? PetName { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public double? Weight { get; set; }
        public string? Allergies { get; set; }
        public short? FeedTypeId { get; set; }
        public string? FeedTypeName { get; set; }
        public short? FeedingFrequency { get; set; }
        public string? Ingredients { get; set; }
        public short? ServingSize { get; set; }
        public string? FeaturesOfCare { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
