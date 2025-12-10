namespace GestorConversaciones.Models
{
    public class Line
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
        public bool Status { get; set; }
        public string? Description { get; set; }
    }
}
