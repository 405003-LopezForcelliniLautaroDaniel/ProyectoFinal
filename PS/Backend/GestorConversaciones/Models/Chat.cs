using Login.Models;
using System.Net.Sockets;

namespace GestorConversaciones.Models
{
    public class Chat
    {
        public Guid Id { get; set; }
        public Guid? IdUser { get; set; }
        public Guid IdClient { get; set; }
        public Guid IdChannel { get; set; }
        public Guid IdCompany { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? IdLine { get; set; }
        public User? User { get; set; }
        public Client? Client { get; set; }
        public Channel? Channel { get; set; }
        public Company? Company { get; set; }
        public Line? Line { get; set; }
    }
}
