namespace GestorConversaciones.Apis.Telegram.Models
{
    public class MessageTelegramRequest
    {
        public Guid IdClient { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid ChatId { get; set; }
        public int MessageType { get; set; } = 1; // 1 = Text, 3 = Video, 4 = Audio, etc.
    }
}

