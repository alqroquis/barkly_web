using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Maps
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrafficController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] Traffic traffic)
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
            if (!TimeSpan.TryParse(traffic.ActivityTime, out var activityTime))
            {
                return BadRequest(new { Message = "Неверный формат времени. Используйте HH:MM:SS" });
            }
            #endregion


            #region Добавление 
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var insertQuery = @"
                                  INSERT INTO traffic_points(
	                                 coords, activity_time, user_id, created_at, updated_at)
	                              VALUES (@Coords, @ActivityTime, @UserId, now(), now())
                                  RETURNING id;";
                try
                {
                    var id = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        traffic.Coords,
                        traffic.ActivityTime,
                        UserId = user.Id
                    });

                    return Ok(new
                    {
                        Id = id
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding traffic: {ex.Message}");
                    return StatusCode(500, new { Message = MessageHelper.GetMessageText(Messages.UnknownError) });
                }
            }
            #endregion
        }


        [HttpGet("list")]
        public async Task<IActionResult> List(int page = 1,
                                              int limit = 500,
                                              string timeStart = "08:00:00",
                                              string timeEnd = "20:00:00",
                                              int? radius = 300,
                                              int? timeWindow = 60)
        {
            #region Валидация параметров
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 500;
            }
            if (!TimeSpan.TryParse(timeStart, out var startTime) ||
                !TimeSpan.TryParse(timeEnd, out var endTime))
            {
                return BadRequest(new { Message = "Неверный формат времени. Используйте HH:MM:SS" });
            }

            radius ??= 300;
            timeWindow ??= 60;
            #endregion

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            int offset = (page - 1) * limit;
            var query = @"
    SELECT 
        id,
        coords,
        activity_time as ActivityTime,
        user_id as UserId,
        (SELECT name FROM users WHERE id = user_id) as UserName,
        created_at as CreatedAt,
        updated_at as UpdatedAt,
        (
            SELECT COUNT(*) 
            FROM traffic_points AS tp2
            WHERE 
                SQRT(
                    POW(69.1 * (tp1.coords[1] - tp2.coords[1]) * 1000, 2) +
                    POW(69.1 * (tp2.coords[2] - tp1.coords[2]) * 
                    COS(tp1.coords[1] / 57.3) * 1000, 2)
                ) < @radius
            AND ABS(
                EXTRACT(EPOCH FROM (tp1.activity_time::time - tp2.activity_time::time))
            ) < @timeWindowSeconds
        ) AS weight
    FROM traffic_points AS tp1
    WHERE 
        activity_time::time BETWEEN @timeStart::time AND @timeEnd::time
        AND deleted_at IS NULL
    LIMIT @limit
    OFFSET @offset";

            try
            {
                var list = await connection.QueryAsync<TrafficList>(query, new
                {
                    limit,
                    offset,
                    radius,
                    timeWindowSeconds = timeWindow * 60,
                    timeStart,
                    timeEnd
                });

                var countQuery = @"
                                    SELECT COUNT(*)
                                    FROM traffic_points
                                    WHERE 
                                        activity_time BETWEEN @timeStart AND @timeEnd 
                                        AND deleted_at IS NULL";

                int totalCount = await connection.ExecuteScalarAsync<int>(countQuery, new
                {
                    timeStart,
                    timeEnd
                });

                return Ok(new
                {
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    Traffic = list.Select(t => new
                    {
                        t.Id,
                        t.Weight,
                        t.ActivityTime,
                        User = new { t.UserId, t.UserName },
                        t.Coords,
                        t.CreatedAt,
                        t.UpdatedAt
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error list traffic: {ex.Message}");
                return StatusCode(500, new { Message = "Internal server error" });
            }
        }
    }

    public class Traffic()
    {
        public required double[] Coords { get; set; }
        public required string ActivityTime { get; set; }
    }


    public class TrafficList() : Traffic
    {
        public long Id { get; set; }
        public int Weight { get; set; }
        public Guid UserId { get; set; }
        public required string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
