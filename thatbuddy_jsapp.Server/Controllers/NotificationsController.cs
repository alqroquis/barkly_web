using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Npgsql;
using thatbuddy_jsapp.Server.Models;

namespace thatbuddy_jsapp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly string _connectionString;

        public NotificationsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        [HttpGet("frequencies")]
        public async Task<IActionResult> GetFrequencies()
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = "SELECT id, name FROM frequency";
            var frequencies = await connection.QueryAsync<Frequency>(sql);

            return Ok(frequencies);
        }
    }
}