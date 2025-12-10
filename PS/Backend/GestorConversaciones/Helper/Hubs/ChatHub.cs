using Microsoft.AspNetCore.SignalR;
using GestorConversaciones.DTO.SignalR;

namespace GestorConversaciones.Helper.Hubs;

public class ChatHub : Hub
{
    // Método para enviar un nuevo mensaje a todos los clientes conectados
    public async Task NotifyNewMessage(NewMessageNotification message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }

    // Método para notificar cambio de estado de chat
    public async Task NotifyChatStatusChange(ChatStatusNotification status)
    {
        await Clients.All.SendAsync("ChatStatusChanged", status);
    }

    // Método para notificar un nuevo chat
    public async Task NotifyNewChat(NewChatNotification newChat)
    {
        await Clients.All.SendAsync("NewChat", newChat);
    }

    // Método para notificar transferencia de chat
    public async Task NotifyChatTransfer(Guid chatId, Guid newUserId)
    {
        await Clients.All.SendAsync("ChatTransferred", new { ChatId = chatId, NewUserId = newUserId });
    }

    // Método que permite a los clientes unirse a un grupo específico de chat
    public async Task JoinChatGroup(string chatId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
    }

    // Método que permite a los clientes salir de un grupo específico de chat
    public async Task LeaveChatGroup(string chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
    }

    // Override para manejar conexiones
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    // Override para manejar desconexiones
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
