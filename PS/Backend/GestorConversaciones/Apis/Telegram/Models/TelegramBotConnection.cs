using Telegram.Bot;

namespace GestorConversaciones.Apis.Telegram.Models
{
    public class TelegramBotConnection
    {
        public TelegramBotClient BotClient { get; set; }
        public string Token { get; set; }
    }

}
