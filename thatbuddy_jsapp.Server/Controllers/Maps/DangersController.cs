using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Maps
{
    [ApiController]
    [Route("api/[controller]")]  
    public class DangersController(DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;

        /// <summary>
        /// Добавление записи об опасности
        /// </summary>
        /// <param name="danger">Объект из тела запроса</param>
        /// <returns>Ид созданной записи</returns>
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] Danger danger)
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
            #endregion


            #region Добавление 
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var insertQuery = @"
                                  INSERT INTO danger_points(
	                                  name, user_id, description, coords, created_at, updated_at)
	                              VALUES (@Name, @UserId, @Description, @Coords, now(), now())
                                  RETURNING id;";
                try
                {
                    var id = await connection.ExecuteScalarAsync<long>(insertQuery, new
                    {
                        danger.Name,
                        UserId = user.Id,
                        danger.Description,
                        danger.Coords
                    });

                    return Ok(new
                    {
                        Id = id
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error adding danger: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }


        /// <summary>
        /// Вывод списка опасностей
        /// </summary>
        /// <param name="page">Номер страницы</param>
        /// <param name="limit">Количество записей на странице</param>
        /// <returns>Список опасностей за последний месяц</returns>
        [HttpGet("list")]
        public async Task<IActionResult> List(int page = 1, int limit = 500)
        {
            #region 
            if (page < 1 || limit < 1)
            {
                page = 1;
                limit = 500;
            }
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                int offset = (page - 1) * limit;
                var insertQuery = @"
                                 select d.id as Id,
		                                d.name as Name, 
		                                d.description as Description, 
		                                d.coords as Coords, 
		                                d.created_at as CreatedAt, 
		                                d.updated_at as UpdatedAt, 
		                                d.user_id as UserId,
		                                u.name as UserName
                                from danger_points d
                                inner join users u on d.user_id = u.id and 
		                                   u.deleted_at is NULL
                                where d.deleted_at is NULL and 
	                                  d.created_at >= date_trunc('month', CURRENT_DATE) and 
	                                  d.created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'
                                limit @limit
                                offset @offset;";
                try
                {
                    var list = await connection.QueryAsync<DangerList>(insertQuery, new
                    {
                       limit,
                       offset
                    });
                    var countQuery = @"
                                    select count(*)
                                    from danger_points d
                                    inner join users u on d.user_id = u.id and 
		                                       u.deleted_at is NULL
                                    where d.deleted_at is NULL and 
	                                      d.created_at >= date_trunc('month', CURRENT_DATE) and 
	                                      d.created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'";
                    int totalCount = await connection.ExecuteScalarAsync<int>(countQuery);

                    return Ok(new
                    {
                        TotalCount = totalCount,
                        Page = page,
                        Limit = limit,
                        Dangers = list.Select(d => new
                        {
                            d.Id,
                            d.Name,
                            d.Description,
                            User = new
                            {
                                Id = d.UserId,
                                Name = d.UserName
                            },
                            d.Coords,
                            d.CreatedAt,
                            d.UpdatedAt
                        }).ToList()
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error list dangers: {ex.Message}");
                    return StatusCode(500, MessageHelper.GetMessageText(Messages.UnknownError));
                }
            }
            #endregion
        }
    }

    public class Danger()
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required double[] Coords { get; set; }
    }


    public class DangerList() : Danger
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid UserId { get; set; }
        public required string UserName { get; set; }
    }
}
