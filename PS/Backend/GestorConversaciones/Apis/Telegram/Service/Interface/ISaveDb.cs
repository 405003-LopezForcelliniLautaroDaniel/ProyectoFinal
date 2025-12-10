using GestorConversaciones.Models;
using Telegram.Bot.Types;
using Chat = GestorConversaciones.Models.Chat;
using Message = GestorConversaciones.Models.Message;

namespace GestorConversaciones.Apis.Telegram.Service.Interface
{
    public interface ISaveDb
    {
        Task<Guid> GuardarExternalAsync(Client chat);
        Task GuardarChatsAsync(Chat chat);
        //Task<int> GuardarChatMemberAsync(Chatmember chat);
        Task GuardarMessageAsync(Message message);
        //Task<InlineKeyboardMarkup> CreateInlineKeyboardForQueues(long? botId);
    }
}
