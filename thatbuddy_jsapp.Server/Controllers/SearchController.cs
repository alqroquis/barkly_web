using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers
{
    [ApiController]
    [Route("api/search")]
    public class SearchController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        [HttpGet("breeds")]
        public async Task<IActionResult> SearchBreeds(string query = "", int page = 1, int limit = 40)
        {
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
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 40;
            }

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                int offset = (page - 1) * limit;

                var sqlQuery = @"
                                SELECT id, name
                                FROM breeds
                                WHERE (@query = '' OR name ILIKE @query)
                                ORDER BY name
                                LIMIT @limit
                                OFFSET @offset";

                var parameters = new
                {
                    query = $"%{query}%",
                    limit,
                    offset
                };
                var breeds = await connection.QueryAsync<IdName>(sqlQuery, parameters);
                var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM breeds
                                    WHERE (@query = '' OR name ILIKE @query)";
                int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { query = $"%{query}%" });

                return Ok(new
                {
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    Breeds = breeds
                });
            }
        }


        [HttpGet("feed-types")]
        public async Task<IActionResult> SearchFeedTypes(string query = "", int page = 1, int limit = 40)
        {
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
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 40;
            }

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                int offset = (page - 1) * limit;

                var sqlQuery = @"
                                SELECT id, name
                                FROM feed_types
                                WHERE (@query = '' OR name ILIKE @query)
                                ORDER BY name
                                LIMIT @limit
                                OFFSET @offset";

                var parameters = new
                {
                    query = $"%{query}%",
                    limit,
                    offset
                };
                var types = await connection.QueryAsync<IdName>(sqlQuery, parameters);
                var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM feed_types
                                    WHERE (@query = '' OR name ILIKE @query)";
                int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new { query = $"%{query}%" });

                return Ok(new
                {
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    FeedTypes = types
                });
            }
        }


        [HttpGet("frequencies")]
        public async Task<IActionResult> SearchFrequencies(int page = 1, int limit = 40)
        {
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

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                int offset = (page - 1) * limit;
                var query = @"
                    SELECT id, name 
                    FROM frequency
                    ORDER BY name
                    LIMIT @limit
                    OFFSET @offset";
                var list = connection.Query<IdName>(query, new { limit, offset }).ToList();

                var countQuery = "SELECT COUNT(*) FROM breeds";
                int totalCount = connection.ExecuteScalar<int>(countQuery);

                return Ok(new
                {
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    List = list
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
