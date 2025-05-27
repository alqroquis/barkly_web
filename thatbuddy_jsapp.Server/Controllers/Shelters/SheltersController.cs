using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Text;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Shelters
{
    [ApiController]
    [Route("api/[controller]")]
    public class SheltersController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        /// <summary>
        /// Получение списка приютов
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> ListShelters()
        {
            var query = @"
                SELECT 
                    s.id as Id,
                    s.name as Name,
                    s.address as Address,
                    s.coords as Coords,
                    s.description as Description,
                    s.logo_url as LogoUrl,
                    s.created_at as CreatedAt
                FROM shelters s
                WHERE s.deleted_at IS NULL
                ORDER BY s.name;";

            using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                var shelters = await connection.QueryAsync<ShelterInfo>(query);
                return Ok(shelters);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving shelters: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }

        /// <summary>
        /// Получение подробной информации о приюте
        /// </summary>
        /// <param name="shelterId">ID приюта</param>
        [HttpGet("details/{shelterId}")]
        public async Task<IActionResult> GetShelterDetails(long shelterId)
        {
            var query = @"
        SELECT 
            s.id as Id,
            s.name as Name,
            s.address as Address,
            s.coords as Coords,
            s.description as Description,
            s.logo_url as LogoUrl,
            s.website_url as WebsiteUrl,
            s.phone_number as PhoneNumber,
            s.email as Email,
            s.working_hours as WorkingHours,
            s.created_at as CreatedAt,
            COUNT(sp.id) as PetsCount
        FROM shelters s
        LEFT JOIN shelter_pets sp ON s.id = sp.shelter_id AND sp.deleted_at IS NULL
        WHERE s.id = @ShelterId AND s.deleted_at IS NULL
        GROUP BY s.id;";

            using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                var shelter = await connection.QueryFirstOrDefaultAsync<ShelterDetailsDto>(query, new { ShelterId = shelterId });
                if (shelter == null)
                {
                    return NotFound(new { Message = MessageHelper.GetMessageText(Messages.ShelterNotFound) });
                }

                return Ok(shelter);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving shelter details: {ex.Message}");
                return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
            }
        }

        /// <summary>
        /// Получение списка питомцев приюта с фильтрацией
        /// </summary>
        /// <param name="shelterId">ID приюта (0 - все приюты)</param>
        /// <param name="filter">Параметры фильтрации</param>
        [HttpGet("{shelterId}")]
        public async Task<IActionResult> ListPets([FromQuery] PetFilterDto filter,int shelterId = 0)
        {
            var query = new StringBuilder(@"
        SELECT 
            p.id as Id,
            p.name as Name,
            p.age_months as Age,
            p.weight as Weight,
            p.color as Color,
            p.description as Description,
            p.vaccination_status as VaccinationStatus,
            p.sterilization_status as SterilizationStatus,
            b.name as BreedName,
            s.name as SizeName,
            g.name as GenderName,
            a.name as AdoptionStatus,
            sh.id as ShelterId,
            sh.name as ShelterName,
            (SELECT photo_url FROM pet_photos WHERE pet_id = p.id AND is_primary = TRUE LIMIT 1) as PrimaryPhotoUrl
        FROM shelter_pets p
        LEFT JOIN breeds b ON p.breed_id = b.id
        LEFT JOIN animal_sizes s ON p.size_id = s.id
        LEFT JOIN animal_genders g ON p.gender_id = g.id
        LEFT JOIN adoption_statuses a ON p.adoption_status_id = a.id
        LEFT JOIN shelters sh ON p.shelter_id = sh.id
        WHERE p.deleted_at IS NULL");

            var parameters = new DynamicParameters();

            // Добавляем фильтр по shelterId, если он указан
            if (shelterId > 0)
            {
                query.Append(" AND p.shelter_id = @ShelterId");
                parameters.Add("ShelterId", shelterId);
            }

            // Добавляем остальные фильтры
            if (filter.BreedId.HasValue)
            {
                query.Append(" AND p.breed_id = @BreedId");
                parameters.Add("BreedId", filter.BreedId.Value);
            }

            if (filter.SizeId.HasValue)
            {
                query.Append(" AND p.size_id = @SizeId");
                parameters.Add("SizeId", filter.SizeId.Value);
            }

            if (filter.GenderId.HasValue)
            {
                query.Append(" AND p.gender_id = @GenderId");
                parameters.Add("GenderId", filter.GenderId.Value);
            }

            if (filter.MinAge.HasValue)
            {
                query.Append(" AND p.age_months/12 >= @MinAge");
                parameters.Add("MinAge", filter.MinAge.Value);
            }

            if (filter.MaxAge.HasValue)
            {
                query.Append(" AND p.age_months/12 <= @MaxAge");
                parameters.Add("MaxAge", filter.MaxAge.Value);
            }

            if (filter.AdoptionStatusId.HasValue)
            {
                query.Append(" AND p.adoption_status_id = @AdoptionStatusId");
                parameters.Add("AdoptionStatusId", filter.AdoptionStatusId.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchText))
            {
                query.Append(" AND (p.name ILIKE @SearchText OR p.description ILIKE @SearchText OR b.name ILIKE @SearchText)");
                parameters.Add("SearchText", $"%{filter.SearchText}%");
            }

            query.Append(" ORDER BY p.name;");

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                try
                {
                    var pets = await connection.QueryAsync<PetListItemDto>(query.ToString(), parameters);
                    return Ok(pets);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving pets: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
        }

        /// <summary>
        /// Получение полной информации о питомце
        /// </summary>
        /// <param name="petId">ID питомца</param>
        [HttpGet("pets/{petId}")]
        public async Task<IActionResult> GetPetDetails(long petId)
        {
            var petQuery = @"
                SELECT 
                    p.id as Id,
                    p.name as Name,
                    p.age_months as AgeMonths,
                    p.weight as Weight,
                    p.color as Color,
                    p.description as Description,
                    p.personality as Personality,
                    p.health_status as HealthStatus,
                    p.vaccination_status as VaccinationStatus,
                    p.sterilization_status as SterilizationStatus,
                    p.created_at as CreatedAt,
                    b.id as BreedId,
                    b.name as BreedName,
                    s.id as SizeId,
                    s.name as SizeName,
                    g.id as GenderId,
                    g.name as GenderName,
                    a.id as AdoptionStatusId,
                    a.name as AdoptionStatus,
                    sh.id as ShelterId,
                    sh.name as ShelterName
                FROM shelter_pets p
                LEFT JOIN breeds b ON p.breed_id = b.id
                LEFT JOIN animal_sizes s ON p.size_id = s.id
                LEFT JOIN animal_genders g ON p.gender_id = g.id
                LEFT JOIN adoption_statuses a ON p.adoption_status_id = a.id
                LEFT JOIN shelters sh ON p.shelter_id = sh.id
                WHERE p.id = @PetId AND p.deleted_at IS NULL;";

            var photosQuery = @"
                SELECT id as Id, photo_url as photoUrl, is_primary as IsPrimary
                FROM pet_photos
                WHERE pet_id = @PetId
                ORDER BY is_primary DESC;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        var pet = await connection.QueryFirstOrDefaultAsync<PetDetailsDto>(petQuery, new { PetId = petId }, transaction);
                        if (pet == null)
                        {
                            return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
                        }

                        var photos = await connection.QueryAsync<PetPhotoDto>(photosQuery, new { PetId = petId }, transaction);

                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            Pet = pet,
                            Photos = photos
                        });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        Console.WriteLine($"Error retrieving pet details: {ex.Message}");
                        return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                    }
                }
            }
        }
    }

    /// <summary>
    /// Модель информации о приюте
    /// </summary>
    public class ShelterInfo
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Address { get; set; }
        public required double[] Coords { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }


    public class ShelterDetailsDto: ShelterInfo
    {
        public string? WebsiteUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? WorkingHours { get; set; }
        public int? PetsCount { get; set; }
    }


    /// <summary>
    /// Модель фильтра для питомцев
    /// </summary>
    public class PetFilterDto
    {
        public int? BreedId { get; set; }
        public int? SizeId { get; set; }
        public int? GenderId { get; set; }
        public int? MinAge { get; set; }
        public int? MaxAge { get; set; }
        public int? AdoptionStatusId { get; set; }
        public string? SearchText { get; set; }
    }


    /// <summary>
    /// Модель краткой информации о питомце для списка
    /// </summary>
    public class PetListItemDto
    {
        public long Id { get; set; }
        public required string Name { get; set; }
        public int? AgeMonths { get; set; }
        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }
        public bool VaccinationStatus { get; set; }
        public bool SterilizationStatus { get; set; }
        public string? BreedName { get; set; }
        public string? SizeName { get; set; }
        public string? GenderName { get; set; }
        public string? AdoptionStatus { get; set; }
        public string? PrimaryPhotoUrl { get; set; }
    }


    /// <summary>
    /// Модель полной информации о питомце
    /// </summary>
    public class PetDetailsDto : PetListItemDto
    {
        public string? Personality { get; set; }
        public string? HealthStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public int BreedId { get; set; }
        public int SizeId { get; set; }
        public int GenderId { get; set; }
        public int AdoptionStatusId { get; set; }
        public int ShelterId { get; set; }
        public required string ShelterName { get; set; }
    }


    /// <summary>
    /// Модель фотографии питомца
    /// </summary>
    public class PetPhotoDto
    {
        public long Id { get; set; }
        public string? PhotoUrl { get; set; }
        public bool IsPrimary { get; set; }
    }
}