using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly TokenService _tokenService;
        private readonly DatabaseService _databaseService;

        public SearchController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration)
        {
            _databaseService = databaseService;
            _tokenService = tokenService;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet("breeds")]
        public async Task<IActionResult> SearchBreeds(int page = 1, int limit = 40)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized("Token validation failed or user ID not found");
            }

            var user = await _databaseService.GetUserByIdAsync(userGuid.Value);
            if (user == null)
            {
                return Unauthorized("Token validation failed or user ID not found");
            }

            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 40;
            }

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                // Рассчитываем OFFSET
                int offset = (page - 1) * limit;

                // Формируем SQL-запрос для получения пород
                var query = @"
                    SELECT id, name
                    FROM breeds
                    ORDER BY name
                    LIMIT @limit
                    OFFSET @offset";

                // Выполняем запрос
                var breeds = connection.Query<IdName>(query, new { limit, offset }).ToList();

                // Получаем общее количество пород (для пагинации)
                var countQuery = "SELECT COUNT(*) FROM breeds";
                int totalCount = connection.ExecuteScalar<int>(countQuery);

                // Возвращаем результат
                return Ok(new
                {
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    Breeds = breeds
                });
            }
        }

        public class IdName
        {
            public int Id { get; set; }
            public string Name { get; set; }
        }
    }
}
