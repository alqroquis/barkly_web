using System.Data;
using Dapper;
using Npgsql;
using thatbuddy_jsapp.Server.Models;


namespace thatbuddy_jsapp.Server.Services
{
    public class DatabaseService(IConfiguration configuration)
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection");

        public async Task<DataTable> ExecuteQueryAsync(string sql)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new NpgsqlCommand(sql, connection);
            await using var reader = await command.ExecuteReaderAsync();

            var dataTable = new DataTable();
            dataTable.Load(reader);

            return dataTable;
        }

        public async Task<int> ExecuteNonQueryAsync(string sql)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new NpgsqlCommand(sql, connection);
            return await command.ExecuteNonQueryAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        SELECT id, email, password_hash AS PasswordHash, name, role, logo_url AS LogoUrl, 
               refresh_token AS RefreshToken, refresh_token_expiry_time AS RefreshTokenExpiryTime, 
               created_at AS CreatedAt, updated_at AS UpdatedAt, deleted_at AS DeletedAt
        FROM users 
        WHERE email = @Email AND deleted_at IS NULL";
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
        }


        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        SELECT id, email, password_hash AS PasswordHash, name, role, logo_url AS LogoUrl, 
               refresh_token AS RefreshToken, refresh_token_expiry_time AS RefreshTokenExpiryTime, 
               created_at AS CreatedAt, updated_at AS UpdatedAt, deleted_at AS DeletedAt
        FROM users 
        WHERE id = @Id AND deleted_at IS NULL";
            return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task CreateUserAsync(User user)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
        VALUES (@Email, @PasswordHash, @Name, @Role, @CreatedAt, @UpdatedAt)";

            await connection.ExecuteAsync(sql, new
            {
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                Name = user.Name,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            });
        }

        public async Task UpdateUserRefreshTokenAsync(Guid userId, string refreshToken, DateTime refreshTokenExpiryTime)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        UPDATE users 
        SET refresh_token = @RefreshToken, 
            refresh_token_expiry_time = @RefreshTokenExpiryTime,
            updated_at = @UpdatedAt
        WHERE id = @UserId";

            await connection.ExecuteAsync(sql, new
            {
                UserId = userId,
                RefreshToken = refreshToken,
                RefreshTokenExpiryTime = refreshTokenExpiryTime,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}