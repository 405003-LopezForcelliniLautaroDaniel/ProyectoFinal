using Login.Models;
using Telegram.Bot.Types.Enums;

namespace GestorConversaciones.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid? IdUser { get; set; }
        public Guid? IdClient { get; set; }
        public Guid IdChat { get; set; }
        public int IdMessageType { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Time { get; set; }
        public User User { get; set; }
        public Client Client { get; set; }
        public Chat Chat { get; set; }
        public MessageType MessageType { get; set; }
    }
}
