using Dapper;
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


        [HttpPost("add")]
        public async Task<IActionResult> AddPet([FromBody] Pet pet)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }
            #endregion


            #region Валидация полей
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (pet.Name == string.Empty)
            {
                return BadRequest("Укажите кличку питомца.");
            }

            if (pet.BirthDate == null && pet.BirthDate > DateTime.UtcNow)
            {
                return BadRequest("Укажите дату рождения питомца.");
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


        [HttpPut("edit/{petId}")]
        public async Task<IActionResult> EditPet(long petId, [FromBody] PetUpdateDto petUpdate)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }
            #endregion


            #region Проверка принадлежности питомца пользователю
            var pet = await GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                Console.WriteLine(pet?.Id.ToString());
                Console.WriteLine(pet?.UserId.ToString());
                Console.WriteLine(user.Id.ToString());
                return NotFound(MessageHelper.GetMessageText(Messages.PetNotFound));
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


        [HttpGet("get/{petId}")]
        public async Task<IActionResult> GetPet(long petId)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
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
                        return NotFound(MessageHelper.GetMessageText(Messages.PetNotFound));
                    }
                    if (petInfo.UserName != user.Name)
                    {
                        return BadRequest(MessageHelper.GetMessageText(Messages.AccessDenied));
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
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        private async Task<Pet?> GetPetByIdAsync(long petId)
        {
            var query = "SELECT id, user_id as UserId, name, description, breed_id as BreedId, birth_date as BirthDate, stigma, microchip FROM pets WHERE id = @Id AND deleted_at IS NULL;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryFirstOrDefaultAsync<Pet>(query, new { Id = petId });
            }
        }


        [HttpDelete("delete/{petId}")]
        public async Task<IActionResult> DeletePet(long petId)
        {
            #region Валидация пользователя
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));
            }
            #endregion

            #region Проверка принадлежности питомца пользователю
            var pet = await GetPetByIdAsync(petId);
            if (pet == null || pet.UserId != user.Id)
            {
                return NotFound(MessageHelper.GetMessageText(Messages.PetNotFound));
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
                        return NotFound(MessageHelper.GetMessageText(Messages.PetNotFound));
                    }

                    return Ok(new { Message = "Питомец успешно удален." });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting pet: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
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
}
