using GestorConversaciones.Apis.Telegram.Models;
using GestorConversaciones.Apis.Telegram.Service.Interface;
using GestorConversaciones.Helper;
using GestorConversaciones.Helper.Hubs;
using GestorConversaciones.Models;
using Login.DataBase;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Net.Http;
using Telegram.Bot;
using Telegram.Bot.Types.ReplyMarkups;
using Message = GestorConversaciones.Models.Message;

namespace GestorConversaciones.Apis.Telegram.Service.Services
{
    public class TelegramService : ITelegramService
    {
        private readonly Context _context;
        private readonly TelegramHelper _helper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TelegramService(Context context, TelegramHelper helper, IHubContext<ChatHub> hubContext, IHttpContextAccessor httpContext, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _helper = helper;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task EnvioMensaje(MessageTelegramRequest message)
        {
            Guid userId = _httpContextAccessor.HttpContext.GetIdUser();
            DateTime currentTime = DateTime.UtcNow.AddHours(-3);


            var chat = await _context.Chats
                .FirstOrDefaultAsync(c => c.IdClient == message.IdClient);

            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == message.IdClient);

            if (chat == null)
            {
                throw new InvalidOperationException("Chat no encontrado para el cliente proporcionado.");
            }


            chat.IdUser = userId;

            var newMessage = new Message
            {
                IdUser = userId,
                IdClient = null,
                IdChat = chat.Id,
                IdMessageType = 1,
                Content = message.Message,
                Time = currentTime
            };

            var conexiones = _helper.Conexiones;
            var conexion = conexiones.FirstOrDefault();
            if (conexion == null)
                throw new Exception("No hay conexiones de Telegram disponibles");

            await conexion.SendTextMessageAsync(
                chatId: client.Contact,
                text: message.Message,
                cancellationToken: default
            );
            var me = await conexion.GetMeAsync(cancellationToken: default);



            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Message>> GetMessage(Guid idClient)
        {
            var idChat = await _context.Chats
                .Where(c => c.IdClient == idClient)
                .Select(c => c.Id)
                .FirstOrDefaultAsync();

            if (idChat == null)
            {
                return new List<Message>();
            }

            var messages = await _context.Messages
                .Include(m => m.User)
                .Include(m => m.Client)
                .Include(m => m.Chat)
                .Include(m => m.MessageType)
                .Where(m => m.IdChat == idChat)
                .OrderBy(m => m.Time)
                .ToListAsync();

            return messages;
        }



    }
}
