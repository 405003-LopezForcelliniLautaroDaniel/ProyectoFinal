using System.Net.Sockets;

namespace GestorConversaciones.Models
{
    public class Client
    {
        public Guid Id { get; set; }
        public string Name { get; set; } 
        public string Contact { get; set; }
        public string Status { get; set; }
        public Guid IdCompany { get; set; }
        public Company Company { get; set; }
    }
}
