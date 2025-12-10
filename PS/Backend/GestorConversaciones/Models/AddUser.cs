using Login.Models;

namespace GestorConversaciones.Models
{
    public class AddUser
    {
        public Guid Id { get; set; }
        public DateTime Pay { get; set; }
        public DateTime Expiration { get; set; }
        public Guid? UserId { get; set; }
        public User? User { get; set; }
        public int Price { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
    }
}
