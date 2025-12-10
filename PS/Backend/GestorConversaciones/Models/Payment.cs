using Login.Models;

namespace GestorConversaciones.Models
{
    public class Payment
    {
        public Guid Id { get; set; }
        public string MercadoPagoId { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Guid CompanyId { get; set; }
        public Company Company { get; set; }
        public int Quantity { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } 
        public string ExternalReference { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        public Payment()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            Status = "pending";
            MercadoPagoId = string.Empty;
            ExternalReference = string.Empty;
        }
    }
}

