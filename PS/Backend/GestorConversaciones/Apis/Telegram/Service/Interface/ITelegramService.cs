using GestorConversaciones.Apis.Telegram.Models;
using GestorConversaciones.Models;
using Message = GestorConversaciones.Models.Message;

namespace GestorConversaciones.Apis.Telegram.Service.Interface
{
    public interface ITelegramService
    {
        Task EnvioMensaje(MessageTelegramRequest message);
        Task<List<Message>> GetMessage(Guid idClient);
    }
}
