using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Text;
using thatbuddy_jsapp.Server.Controllers.Families;
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


            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        // Проверка количества питомцев
                        var countQuery = "SELECT COUNT(*) FROM pets WHERE user_id = @UserId AND deleted_at IS NULL";
                        int petCount = await connection.ExecuteScalarAsync<int>(countQuery, new { UserId = user.Id }, transaction);

                        if (petCount >= 10)
                        {
                            return BadRequest(MessageHelper.GetMessageText(Messages.TooManyPetsForUser));
                        }

                        // Добавление питомца
                        var insertPetQuery = @"
                    INSERT INTO pets (breed_id, birth_date, logo_url, name, stigma, microchip, description, user_id, created_at)
                    VALUES (@BreedId, @BirthDate, @LogoUrl, @Name, @Stigma, @Microchip, @Description, @UserId, now())
                    RETURNING id;";

                        var petId = await connection.ExecuteScalarAsync<long>(insertPetQuery, new
                        {
                            pet.BreedId,
                            pet.BirthDate,
                            pet.LogoUrl,
                            pet.Name,
                            pet.Stigma,
                            pet.Microchip,
                            pet.Description,
                            UserId = user.Id
                        }, transaction);

                        // Создание пустой медицинской карты
                        var insertMedCardQuery = @"
                    INSERT INTO med_cards (pet_id, created_at)
                    VALUES (@PetId, now())
                    RETURNING id;";

                        await connection.ExecuteScalarAsync<long>(insertMedCardQuery, new { PetId = petId }, transaction);

                        await transaction.CommitAsync();

                        return Ok(new { Id = petId });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        Console.WriteLine($"Error adding pet: {ex.Message}");
                        return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                    }
                }
            }
        }

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

            #region Проверка принадлежности питомца
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
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

            // Добавляем обновление логотипа
            if (petUpdate.LogoUrl != null)
            {
                updateQuery.Append("logo_url = @LogoUrl, ");
                parameters.Add("LogoUrl", petUpdate.LogoUrl);
            }

            if (updateQuery.Length > 0)
            {
                updateQuery.Length -= 2; // Удаляем последнюю запятую и пробел
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


            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
            }
            #endregion


            #region Получение информации о питомце
            var query = @"
                        SELECT 
                            p.id AS PetId,
                            p.name AS PetName,
                            p.logo_url as LogoUrl,
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
                        petInfo.LogoUrl,
                        Stigma = petInfo.PetStigma,
                        Microchip = petInfo.PetMicrochip,
                        Birthdate = petInfo.PetBirthDate,
                        Description = petInfo.PetDescription
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


            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
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
                                (p.user_id = @UserId OR 
                                 EXISTS (
                                    SELECT 1 
                                    FROM family_members fm
                                    JOIN families f ON fm.family_id = f.id
                                    WHERE fm.user_id = p.user_id
                                    AND f.owner_id = @UserId
                                    AND fm.deleted_at IS NULL
                                    AND f.deleted_at IS NULL
                                 ))
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


            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
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

            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
            }
            #endregion

            #region Получение информации о питомце
            var query = @"
                        WITH last_treatments AS (
                            SELECT DISTINCT ON (pet_id, treatment_type_id)
                                id,
                                pet_id,
                                treatment_type_id,
                                description,
                                treatment_date
                            FROM 
                                treatments
                            WHERE 
                                deleted_at IS NULL
                                AND treatment_type_id IN (1, 2)
                            ORDER BY 
                                pet_id, treatment_type_id, treatment_date DESC
                        ),
                        last_injury AS (
                            SELECT DISTINCT ON (pet_id)
                                id,
		                        pet_id,
                                name,
                                injury_date
                            FROM 
                                injuries
                            WHERE 
                                deleted_at IS NULL
                            ORDER BY 
                                pet_id, injury_date DESC
                        ),
                        last_chronic_disease AS (
                            SELECT DISTINCT ON (pet_id)
                                id,
                                name,
		                        pet_id,
                                created_at
                            FROM 
                                chronic_diseases
                            WHERE 
                                deleted_at IS NULL
                            ORDER BY 
                                pet_id, created_at DESC
                        )
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
		 
		                         lt1.id as LastTicksTreatmentId,
	                             lt1.description as LastTicksTreatmentDesc,
	                             lt1.treatment_date as LastTicksTreatmentDate,
		 
	                             lt2.id as LastFleasTreatmentId,
	                             lt2.description as LastFleasTreatmentDesc,
	                             lt2.treatment_date as LastFleasTreatmentDate,
		 
		                         li.id as LastInjuryId,
	                             li.name as LastInjuryName,
	                             li.injury_date as LastInjuryDate,

		                         lcd.id as LastChronicDiseaseId,
	                             lcd.name as LastChronicDiseaseName,
	                             lcd.created_at as LastChronicDiseaseDate,
	
                                 m.created_at as CreatedAt, 
                                 m.updated_at as UpdatedAt 
                         FROM public.med_cards m
                                 inner join pets p on p.id = m.pet_id and 
					                                   p.deleted_at is NULL 
                                 inner join users u on u.id = p.user_id and 
					                                    u.deleted_at is NULL
                                 inner join feed_types f on f.id = m.feed_type_id 
		                         left outer join last_treatments lt1 on lt1.pet_id = m.pet_id and 
		 										                         lt1.treatment_type_id = 1 
		                         left outer join last_treatments lt2 on lt2.pet_id = m.pet_id and 
		 										                         lt2.treatment_type_id = 2
		                         LEFT JOIN last_injury li ON li.pet_id = m.pet_id
    	                         LEFT JOIN last_chronic_disease lcd ON lcd.pet_id = m.pet_id
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
                        medInfo.Id,
                        Pet = new
                        {
                            Id = medInfo.PetId,
                            Name = medInfo.PetName
                        },
                        User = new
                        {
                            Id = medInfo.UserId,
                            Name = medInfo.UserName
                        },
                        medInfo.Weight,
                        medInfo.Allergies,
                        FeedType = new
                        {
                            Id = medInfo.FeedTypeId,
                            Name = medInfo.FeedTypeName
                        },
                        medInfo.FeedingFrequency,
                        medInfo.Ingredients,
                        medInfo.ServingSize,
                        medInfo.FeaturesOfCare,
                        LastTicksTreatment = new
                        {
                            Id = medInfo.LastTicksTreatmentId,
                            Desc = medInfo.LastTicksTreatmentDesc,
                            TreatmentDate = medInfo.LastTicksTreatmentDate
                        },
                        LastFleasTreatment = new
                        {
                            Id = medInfo.LastFleasTreatmentId,
                            Desc = medInfo.LastFleasTreatmentDesc,
                            TreatmentDate = medInfo.LastFleasTreatmentDate
                        },
                        LastInjury = new
                        {
                            Id = medInfo.LastInjuryId,
                            Name = medInfo.LastInjuryName,
                            Date = medInfo.LastInjuryDate
                        },
                        LastChronicDisease = new
                        {
                            Id = medInfo.LastChronicDiseaseId,
                            Name = medInfo.LastChronicDiseaseName,
                            Date = medInfo.LastChronicDiseaseDate
                        },
                        medInfo.CreatedAt,
                        medInfo.UpdatedAt

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


        [HttpPut("edit-medicine-card/{petId}")]
        public async Task<IActionResult> EditMedicineCard(long petId, [FromBody] MedicineCardUpdateDto medicineCardUpdate)
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

            #region Проверка принадлежности питомца пользователю или семье
            var pet = await _databaseService.GetPetByIdAsync(petId);
            if (pet == null)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            // Если питомец не принадлежит пользователю, проверяем семью
            if (pet.UserId != user.Id)
            {
                var isFamilyPet = await new FamilyController(_databaseService, _tokenService, configuration)
                    .IsPetBelongsToFamily(petId, user.Id);

                if (!isFamilyPet)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                }
            }
            #endregion

            #region Проверка существования медицинской карты
            var existingMedicineCard = await _databaseService.GetMedicineCardByPetIdAsync(petId);
            if (existingMedicineCard == null)
            {
                return NotFound(new { Message = "Медицинская карта питомца не найдена." });
            }
            #endregion

            #region Обновление данных медицинской карты
            var updateQuery = new StringBuilder("UPDATE med_cards SET ");
            var parameters = new DynamicParameters();
            parameters.Add("PetId", petId);

            if (medicineCardUpdate.Allergies != null)
            {
                updateQuery.Append("allergies = @Allergies, ");
                parameters.Add("Allergies", medicineCardUpdate.Allergies);
            }

            if (medicineCardUpdate.Weight != null)
            {
                updateQuery.Append("weight = @Weight, ");
                parameters.Add("Weight", medicineCardUpdate.Weight);
            }

            if (medicineCardUpdate.FeedTypeId != null)
            {
                updateQuery.Append("feed_type_id = @FeedTypeId, ");
                parameters.Add("FeedTypeId", medicineCardUpdate.FeedTypeId);
            }

            if (medicineCardUpdate.FeedingFrequency != null)
            {
                updateQuery.Append("feeding_frequency = @FeedingFrequency, ");
                parameters.Add("FeedingFrequency", medicineCardUpdate.FeedingFrequency);
            }

            if (medicineCardUpdate.Ingredients != null)
            {
                updateQuery.Append("ingredients = @Ingredients, ");
                parameters.Add("Ingredients", medicineCardUpdate.Ingredients);
            }

            if (medicineCardUpdate.ServingSize != null)
            {
                updateQuery.Append("serving_size = @ServingSize, ");
                parameters.Add("ServingSize", medicineCardUpdate.ServingSize);
            }

            if (medicineCardUpdate.FeaturesOfCare != null)
            {
                updateQuery.Append("features_of_care = @FeaturesOfCare, ");
                parameters.Add("FeaturesOfCare", medicineCardUpdate.FeaturesOfCare);
            }

            // Удаляем последнюю запятую и пробел
            if (updateQuery.Length > 0)
            {
                updateQuery.Length -= 2;
            }

            updateQuery.Append(" WHERE pet_id = @PetId;");

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                try
                {
                    var affectedRows = await connection.ExecuteAsync(updateQuery.ToString(), parameters);

                    if (affectedRows == 0)
                    {
                        return NotFound(new { Message = "Медицинская карта не найдена." });
                    }

                    return Ok(new { Message = "Медицинская карта успешно обновлена." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating medicine card: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }
    }


    /// <summary>
    /// Модель обновления записи о питомцев
    /// </summary>
    public class PetUpdateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? BreedId { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Stigma { get; set; }
        public string? Microchip { get; set; }
        public string? LogoUrl { get; set; }
    }


    /// <summary>
    /// Модель записи питомца для вывода в список
    /// </summary>
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
        public string? LogoUrl { get; set; }
    }


    /// <summary>
    /// Модель медицинской карты
    /// </summary>
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


    /// <summary>
    /// Модель медицинской карты для вывода в список
    /// </summary>
    public class MedInfo : MedicineCard
    {
        public long Id { get; set; }
        public long PetId { get; set; }
        public string? PetName { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? FeedTypeName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public long? LastTicksTreatmentId { get; set; }
        public string? LastTicksTreatmentDesc { get; set; }
        public DateTime? LastTicksTreatmentDate { get; set; }
        public long? LastFleasTreatmentId { get; set; }
        public string? LastFleasTreatmentDesc { get; set; }
        public DateTime? LastFleasTreatmentDate { get; set; }
        public long? LastInjuryId { get; set; }
        public string? LastInjuryName { get; set; }
        public DateTime? LastInjuryDate { get; set; }
        public long? LastChronicDiseaseId { get; set; }
        public string? LastChronicDiseaseName { get; set; }
        public DateTime? LastChronicDiseaseDate { get; set; }
    }
      

    public class MedicineCardUpdateDto
    {
        public string? Allergies { get; set; }
        public float? Weight { get; set; }
        public long? FeedTypeId { get; set; }
        public int? FeedingFrequency { get; set; }
        public string? Ingredients { get; set; }
        public int? ServingSize { get; set; }
        public string? FeaturesOfCare { get; set; }
    }
}
