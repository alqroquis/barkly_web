using Dapper;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace thatbuddy_jsapp.Server.Controllers.Articles
{
    [ApiController]
    [Route("api/articles")]
    public class ArticlesController(IConfiguration configuration) : ControllerBase
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var categories = await connection.QueryAsync<ArticleCategory>(@"
                SELECT id, name, slug 
                FROM article_categories 
                ORDER BY name");

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Ошибка сервера" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetArticles([FromQuery] string category = null, [FromQuery] int limit = 3)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
                SELECT 
                    a.id, 
                    a.title, 
                    a.slug, 
                    a.excerpt, 
                    a.image_url as ImageUrl,
                    a.created_at as CreatedAt,
                    c.name as CategoryName,
                    c.slug as CategorySlug
                FROM articles a
                JOIN article_categories c ON a.category_id = c.id
                WHERE (@category IS NULL OR c.slug = @category)
                ORDER BY a.created_at DESC
                LIMIT @limit";

                var articles = await connection.QueryAsync<ArticleDto>(sql, new { category, limit });

                return Ok(articles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Ошибка сервера" });
            }
        }

        [HttpGet("{categorySlug}/{articleSlug}")]
        public async Task<IActionResult> GetArticle(string categorySlug, string articleSlug)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var sql = @"
            SELECT 
                a.id, 
                a.title, 
                a.content,
                a.image_url as ImageUrl,
                a.created_at as CreatedAt,
                c.name as CategoryName,
                c.slug as CategorySlug
            FROM articles a
            JOIN article_categories c ON a.category_id = c.id
            WHERE c.slug = @categorySlug AND a.slug = @articleSlug";

                var article = await connection.QueryFirstOrDefaultAsync<ArticleDetailDto>(sql, new
                {
                    categorySlug,
                    articleSlug
                });

                if (article == null)
                {
                    return NotFound(new { Message = "Статья не найдена" });
                }

                return Ok(article);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return StatusCode(500, new { Message = ex.Message });
            }
        }
    }

    public class ArticleDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; }
        public string CategorySlug { get; set; }
        public string AuthorName { get; set; }
    }

    public class ArticleCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
    }

    public class ArticleDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string Excerpt { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; }
        public string CategorySlug { get; set; }
    }
}
