namespace thatbuddy_jsapp.Server.Models.Pets
{
    public class Pet
    {
        public long? Id { get; set; }
        public short? BreedId { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? LogoUrl { get; set; }
        public string? Name { get; set; }
        public string? Stigma { get; set; }
        public string? Microchip { get; set; }
        public string? Description { get; set; }
        public Guid? UserId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
