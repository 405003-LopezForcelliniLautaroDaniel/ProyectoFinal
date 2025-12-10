

using GestorConversaciones.Apis.Telegram.Models;
using GestorConversaciones.DTO.Request.Chat;
using GestorConversaciones.DTO.Result.Client;
using GestorConversaciones.DTO.Result.Message;

namespace GestorConversaciones.Services.Interface
{
    public interface IChatService
    {
        Task<List<ChatResult>> GetAllChat();
        Task<List<MessageResult>> GetChat(Guid id);
        Task<MessageResult> SendMessage(SendMessageRequest message);
        Task ArchivedChat(Guid idChat);
        Task TransferChat(TransferChatRequest chat);
    }
}
