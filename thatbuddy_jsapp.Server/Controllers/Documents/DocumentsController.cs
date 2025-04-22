using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.ComponentModel.DataAnnotations;
using System.Net.Http.Headers;
using System.Reflection.Metadata;
using thatbuddy_jsapp.Server.Services;

namespace thatbuddy_jsapp.Server.Controllers.Documents
{
    [ApiController]
    [Route("api/documents")]
    public class DocumentsController(IFileService fileService, DatabaseService databaseService, TokenService tokenService, IConfiguration configuration) : ControllerBase
    {
        private readonly IFileService _fileService = fileService;
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly TokenService _tokenService = tokenService;
        private readonly DatabaseService _databaseService = databaseService;


        [HttpPost("upload/{petId:long}")]
        public async Task<IActionResult> Upload(IFormFile file, long petId)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
                return Unauthorized(MessageHelper.GetMessageText(Messages.InvalidOrMissingToken));

            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "No file uploaded" });

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { Message = "File size exceeds 10MB limit" });

            try
            {
                var fileName = await _fileService.SaveFileAsync(file);
                if (string.IsNullOrEmpty(fileName))
                    return BadRequest(new { Message = "Failed to save file" });

                var document = new Document
                {
                    OriginalName = Path.GetFileName(file.FileName), 
                    FileName = fileName,
                    FileType = file.ContentType,
                    FileSize = file.Length,
                    UserId = userGuid.Value,
                    PetId = petId,
                    UploadDate = DateTime.UtcNow
                };

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    var sql = @"
                INSERT INTO documents 
                    (original_name, file_name, file_type, file_size, user_id, pet_id, upload_date)
                VALUES 
                    (@OriginalName, @FileName, @FileType, @FileSize, @UserId, @PetId, @UploadDate)
                RETURNING id";
                    document.Id = await connection.ExecuteScalarAsync<Guid>(sql, document);
                }

                return Ok(new { document.Id, document.OriginalName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> Download(Guid id, [FromQuery] bool download = false)
        {
            try
            {
                var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
                if (userGuid == null)
                {
                    return Unauthorized(new { message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
                }

                Document? document;
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    var sql = @"SELECT  id, 
                        original_name as OriginalName, 
                        file_name as FileName, 
                        file_type as FileType,
                        file_size as FileSize, 
                        upload_date as UploadDate 
FROM documents WHERE id = @Id AND user_id = @UserId";
                    document = await connection.QueryFirstOrDefaultAsync<Document>(sql, new
                    {
                        Id = id,
                        UserId = userGuid.Value
                    });
                }

                if (document == null)
                {
                    return NotFound(new { message = "Document not found" });
                }

                // Дополнительная проверка имени файла
                if (string.IsNullOrWhiteSpace(document.FileName))
                {
                    return BadRequest(new { message = "Invalid file name in database" });
                }

                // Очистка имени файла от потенциально опасных символов
                var cleanFileName = Path.GetFileName(document.FileName);
                if (string.IsNullOrWhiteSpace(cleanFileName))
                {
                    return BadRequest(new { message = "Invalid file name format" });
                }

                var filePath = _fileService.GetFilePath(cleanFileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = $"File not found at path: {filePath}" });
                }

                var fileStream = System.IO.File.OpenRead(filePath);

                if (download)
                {
                    // Файл будет автоматически закрыт после отправки
                    return File(fileStream, document.FileType, document.OriginalName);
                }
                else
                {
                    if (document.FileType.StartsWith("image/") ||
                        document.FileType == "application/pdf" ||
                        document.FileType == "text/plain")
                    {
                        Response.Headers.Append("Content-Disposition", $"inline; filename=\"{document.OriginalName}\"");
                        return File(fileStream, document.FileType);
                    }
                    return File(fileStream, document.FileType, document.OriginalName);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


        [HttpGet("list/{id}")]
        public async Task<IActionResult> List(long id)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            var pet = await _databaseService.GetPetByIdAsync(id);
            if (pet == null || pet.UserId != userGuid)
            {
                return NotFound(new { Message = MessageHelper.GetMessageText(Messages.PetNotFound) });
            }

            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var sql = @"
                SELECT  id, 
                        original_name as OriginalName, 
                        file_name as FileName, 
                        file_type as FileType,
                        file_size as FileSize, 
                        upload_date as UploadDate
                FROM documents 
                WHERE user_id = @UserId and 
                      pet_id = @PetId
                ORDER BY upload_date DESC";

                    var documents = await connection.QueryAsync<DocumentDto>(sql, new { UserId = userGuid.Value, PetId = id });

                    return Ok(documents);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal error: {ex.Message}" });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userGuid = _tokenService.ValidateTokenAndGetClaims(Request);
            if (userGuid == null)
            {
                return Unauthorized(new { Message = MessageHelper.GetMessageText(Messages.InvalidOrMissingToken) });
            }

            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (var transaction = await connection.BeginTransactionAsync())
                    {
                        try
                        {
                            var getSql = @"
                        SELECT file_name 
                        FROM documents 
                        WHERE id = @Id AND user_id = @UserId";

                            var fileName = await connection.ExecuteScalarAsync<string>(
                                getSql,
                                new { Id = id, UserId = userGuid.Value },
                                transaction);

                            if (fileName == null)
                                return NotFound(new { Message = "Документ не найден" });

                            var deleteSql = @"
                        DELETE FROM documents 
                        WHERE id = @Id AND user_id = @UserId";

                            var affectedRows = await connection.ExecuteAsync(
                                deleteSql,
                                new { Id = id, UserId = userGuid.Value },
                                transaction);

                            if (affectedRows == 0)
                                return NotFound(new { Message = "Документ не найден" });

                            var filePath = _fileService.GetFilePath(fileName);
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                            }

                            await transaction.CommitAsync();
                            return NoContent();
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Internal error: {ex.Message}" });
            }
        }
    }

    public class Document
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public required string OriginalName { get; set; }

        [Required]
        [MaxLength(255)]
        public required string FileName { get; set; }

        [Required]
        [MaxLength(255)]
        public required string FileType { get; set; }

        [Required]
        public long FileSize { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        public Guid? UserId { get; set; }

        public long? PetId { get; set; }
    }

    public class DocumentDto: Document
    {

        public string FormattedSize => FileSize switch
        {
            < 1024 => $"{FileSize} B",
            < 1024 * 1024 => $"{FileSize / 1024} KB",
            _ => $"{FileSize / (1024 * 1024)} MB"
        };
    }
}
