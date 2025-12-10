using GestorConversaciones.Apis.Telegram.Service.Interface;
using GestorConversaciones.Helper.Hubs;
using GestorConversaciones.Models;
using Login.DataBase;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Chat = GestorConversaciones.Models.Chat;
using Message = GestorConversaciones.Models.Message;

namespace GestorConversaciones.Apis.Telegram.Service.Services
{
    public class SaveDb : ISaveDb
    {
        private readonly Context _dataContext;
        private readonly IHubContext<ChatHub> _hubContext;

        public SaveDb(Context dataContext, IHubContext<ChatHub> hubContext)
        {
            _dataContext = dataContext;
            _hubContext = hubContext;
        }
        public async Task<Guid> GuardarExternalAsync(Client external)
        {
            var existingExternal = await _dataContext.Clients
                .FirstOrDefaultAsync(e => e.Contact == external.Contact && e.IdCompany == external.IdCompany);

            if (existingExternal != null)
            {
                return existingExternal.Id;
            }

            _dataContext.Clients.Add(external);

            await _dataContext.SaveChangesAsync();

            return external.Id;
        }
        public async Task GuardarChatsAsync(Chat chat)
        {
            _dataContext.Chats.Add(chat);

            await _dataContext.SaveChangesAsync();
        }
        public async Task GuardarMessageAsync(Message message)
        {
            _dataContext.Messages.Add(message);

            await _dataContext.SaveChangesAsync();

            // Evitar el envío de mensajes a todos los clientes
            //await _hubContext.Clients.All.SendAsync("ReceiveMessage", message.IdClient, message.Client.Name, message.IdChat, message.Content);
        }
    }
}
