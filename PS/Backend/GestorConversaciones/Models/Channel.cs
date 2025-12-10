namespace GestorConversaciones.Models
{
    public class Channel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Contact { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
        public long ObjectId { get; set; }
    }
}
