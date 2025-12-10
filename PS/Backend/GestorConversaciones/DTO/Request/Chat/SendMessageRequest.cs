using Telegram.Bot.Types;

namespace GestorConversaciones.DTO.Request.Chat
{
    public class SendMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? Type { get; set; } = "Texto";
        public Guid IdChat { get; set; }
        public IFormFile? File { get; set; }
    }
}
