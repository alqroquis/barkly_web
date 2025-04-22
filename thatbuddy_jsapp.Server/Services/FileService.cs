namespace thatbuddy_jsapp.Server.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<FileService> _logger;
        private const string UploadSubfolder = "docs";

        public FileService(IWebHostEnvironment env, ILogger<FileService> logger)
        {
            _env = env;
            _logger = logger;
        }

        public async Task<string> SaveFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            var uploadsPath = Path.Combine(_env.ContentRootPath, "uploads", UploadSubfolder);
            Directory.CreateDirectory(uploadsPath);

            var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(uploadsPath, uniqueName);

            try
            {
                await using var stream = new FileStream(fullPath, FileMode.Create);
                await file.CopyToAsync(stream);
                return uniqueName;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file");
                throw new IOException("Failed to save file", ex);
            }
        }

        public string GetFilePath(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
            {
                throw new ArgumentException("Invalid file name");
            }

            var uploadPath = Path.Combine(_env.ContentRootPath, "uploads", "docs");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            return Path.Combine(uploadPath, fileName);
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var filePath = GetFilePath(fileName);
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
            }
        }
    }

    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file);
        string GetFilePath(string fileName);
        Task DeleteFileAsync(string fileName);
    }
}
