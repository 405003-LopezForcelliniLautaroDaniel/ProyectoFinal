using Login.Models;
using System.Net.Sockets;

namespace GestorConversaciones.Models
{
    public class Calendar
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public DateTime Time { get; set; }
        public Guid IdCompany { get; set; }
        public Guid IdUser { get; set; }
        public Guid? IdClient { get; set; }
        public Company Company { get; set; }
        public Client Client { get; set; }
        public User User { get; set; }
    }
}
