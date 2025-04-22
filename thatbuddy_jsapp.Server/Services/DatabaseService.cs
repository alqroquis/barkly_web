using System.Data;
using Dapper;
using Npgsql;
using thatbuddy_jsapp.Server.Controllers.Pets;
using thatbuddy_jsapp.Server.Models;
using thatbuddy_jsapp.Server.Models.Pets;


namespace thatbuddy_jsapp.Server.Services
{
    public class DatabaseService(IConfiguration configuration)
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
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


        /// <summary>
        /// 
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        public async Task<int> ExecuteNonQueryAsync(string sql)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            await using var command = new NpgsqlCommand(sql, connection);
            return await command.ExecuteNonQueryAsync();
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        public async Task<UserModel?> GetUserByEmailAsync(string email)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        SELECT id, email, password_hash AS PasswordHash, name, role, logo_url AS LogoUrl, 
               refresh_token AS RefreshToken, refresh_token_expiry_time AS RefreshTokenExpiryTime, 
               created_at AS CreatedAt, updated_at AS UpdatedAt, deleted_at AS DeletedAt
        FROM users 
        WHERE email = @Email AND deleted_at IS NULL";
            return await connection.QueryFirstOrDefaultAsync<UserModel>(sql, new { Email = email });
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<UserModel?> GetUserByIdAsync(Guid id)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
        SELECT id, email, password_hash AS PasswordHash, name, role, logo_url AS LogoUrl, 
               refresh_token AS RefreshToken, refresh_token_expiry_time AS RefreshTokenExpiryTime, 
               created_at AS CreatedAt, updated_at AS UpdatedAt, deleted_at AS DeletedAt
        FROM users 
        WHERE id = @Id AND deleted_at IS NULL";
            return await connection.QueryFirstOrDefaultAsync<UserModel>(sql, new { Id = id });
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public async Task CreateUserAsync(UserModel user)
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


        /// <summary>
        /// 
        /// </summary>
        /// <param name="petId"></param>
        /// <returns></returns>
        public async Task<MedicineCard?> GetMedicineCardByPetIdAsync(long petId)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            var query = "SELECT * FROM med_cards WHERE pet_id = @PetId AND deleted_at IS NULL;";
            return await connection.QueryFirstOrDefaultAsync<MedicineCard>(query, new { PetId = petId });
        }


        /// <summary>
        /// Получение питомца по Id для проверки существования записи
        /// </summary>
        /// <param name="petId">Id питомца</param>
        public async Task<Pet?> GetPetByIdAsync(long petId)
        {
            var query = "SELECT id, user_id as UserId, name, description, breed_id as BreedId, birth_date as BirthDate, stigma, microchip FROM pets WHERE id = @Id AND deleted_at IS NULL;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                return await connection.QueryFirstOrDefaultAsync<Pet>(query, new { Id = petId });
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="refreshToken"></param>
        /// <param name="refreshTokenExpiryTime"></param>
        /// <returns></returns>
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