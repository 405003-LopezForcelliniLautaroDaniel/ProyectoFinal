using GestorConversaciones.Apis.Telegram;
using GestorConversaciones.Apis.Telegram.Models;
using GestorConversaciones.DTO.Request.Chat;
using GestorConversaciones.DTO.Result.Client;
using GestorConversaciones.DTO.Result.Message;
using GestorConversaciones.Helper;
using GestorConversaciones.Models;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot;
using Microsoft.AspNetCore.SignalR;
using GestorConversaciones.Helper.Hubs;
using GestorConversaciones.DTO.SignalR;
using Telegram.Bot.Types;
using System.Linq;

namespace GestorConversaciones.Services.Service
{
    public class ChatService : IChatService
    {
        private readonly Context _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TelegramHelper _helper;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatService(Context context, IHttpContextAccessor httpContextAccessor, TelegramHelper helper, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _helper = helper;
            _hubContext = hubContext;
        }

        public async Task<List<ChatResult>> GetAllChat()
        {
            var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
            var idUser = _httpContextAccessor.HttpContext.GetIdUser();

            // 🔹 Obtener solo los IdLine no nulos del usuario como List<Guid>
            var userLines = await _context.LineUsers
                .Where(l => l.IdUser == idUser && l.IdLine != null)
                .Select(l => l.IdLine) // ahora es Guid (no nullable)
                .ToListAsync();

            try
            {
                var chats = await _context.Chats
                    .Include(c => c.Client)
                    .Where(c =>
                        c.IdCompany == idCompany &&
                        c.IdLine != null &&                      
                        userLines.Contains(c.IdLine.Value) &&    
                        (
                            c.Status != "taken" ||
                            (c.Status == "taken" && c.IdUser == idUser)
                        )
                    )
                    .ToListAsync();

                var result = chats.Select(c => new ChatResult
                {
                    Id = c.Id,
                    NameClient = c.Client?.Name ?? "Sin nombre",
                    Status = c.Status,
                    Contact = c.Client?.Contact,
                    IdLine = c.IdLine,
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al buscar chats", ex);
            }
        }




        public async Task<List<MessageResult>> GetChat(Guid id)
        {

            try
            {
                var message = await _context.Messages
                    .Include(c => c.Client)
                    .Where(c => c.IdChat == id)
                    .ToListAsync();

                var result = message.Select(c => new MessageResult
                {
                    Id = c.Id,
                    IdUser = c.IdUser,
                    IdClient = c.IdClient,
                    IdChat = c.IdChat,
                    IdMessageType = c.IdMessageType,
                    Content = c.Content,
                    Time = c.Time,
                }).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al buscar chats", ex);
            }
        }
        public async Task<MessageResult> SendMessage(SendMessageRequest message)
        {
            var idUser = _httpContextAccessor.HttpContext.GetIdUser();
            DateTime currentTime = DateTime.UtcNow.AddHours(-3);


            var chat = await _context.Chats
                .FirstOrDefaultAsync(c => c.Id == message.IdChat);

            if (chat == null)
            {
                throw new InvalidOperationException("Chat no encontrado para el cliente proporcionado.");
            }

            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == chat.IdClient);

            // Normalizar tipo: por defecto Texto si no viene
            message.Type = string.IsNullOrWhiteSpace(message.Type) ? "Texto" : message.Type;

            // Enviar por Telegram y obtener el contenido entregado (texto o URL)
            var deliveredContent = await SendMessageTelegram(message, client.Contact);

            chat.IdUser = idUser;

            // Mapear tipo a IdMessageType
            int idMessageType = message.Type switch
            {
                "Texto" => 1,
                "Imagen" => 2,
                "Archivo" => 3,
                "Audio" => 4,
                _ => 1
            };

            var newMessage = new Models.Message
            {
                IdUser = idUser,
                IdClient = null,
                IdChat = chat.Id,
                IdMessageType = idMessageType,
                Content = string.IsNullOrWhiteSpace(deliveredContent) ? message.Message : deliveredContent,
                Time = currentTime
            };

            if (chat.Status == "pending")
            {
                chat.Status = "taken";
            }

            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            MessageResult messageResult = new MessageResult
            {
                Id = newMessage.Id,
                IdUser = idUser,
                IdClient = chat.IdClient,
                IdChat = chat.Id,
                IdMessageType = idMessageType,
                Content = newMessage.Content,
                Time = newMessage.Time
            };

            // Notificar a través de SignalR
            var notification = new NewMessageNotification
            {
                IdChat = chat.Id,
                IdUser = idUser,
                IdClient = chat.IdClient,
                IdMessageType = idMessageType,
                Content = newMessage.Content,
                Time = currentTime,
                ClientName = client?.Name ?? "Sin nombre"
            };
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", notification);

            // Si el estado cambió a "taken", notificar también
            if (chat.Status == "taken")
            {
                var statusNotification = new ChatStatusNotification
                {
                    IdChat = chat.Id,
                    Status = "taken",
                    ClientName = client?.Name ?? "Sin nombre",
                    IdUser = idUser
                };
                await _hubContext.Clients.All.SendAsync("ChatStatusChanged", statusNotification);
            }

            return messageResult;

        }


        public async Task<string?> SendMessageTelegram(SendMessageRequest message, string phone)
        {
            try
            {


            var idCompany = _httpContextAccessor.HttpContext.GetIdCompany();
            var token = await _context.Channels.FirstOrDefaultAsync(c => c.IdCompany == idCompany);

            var conexion = _helper._conexiones
                .FirstOrDefault(c => c.Token == token.Contact)?.BotClient;

            switch (message.Type)
            {
                case "Texto":
                    await conexion.SendTextMessageAsync(
                    chatId: phone,
                        text: message.Message
                    );
                    return message.Message;

                case "Imagen":
                    if (message.File == null) throw new ArgumentNullException(nameof(message.File));
                    using (var stream = message.File.OpenReadStream())
                    {
                        var inputPhoto = new InputFileStream(stream, message.File.FileName);
                        var tgMsg = await conexion.SendPhotoAsync(
                            chatId: phone,
                            photo: inputPhoto
                            //caption: message.Message
                        );
                        var best = tgMsg.Photo?.OrderByDescending(p => p.FileSize).FirstOrDefault();
                        if (best != null)
                        {
                            var file = await conexion.GetFileAsync(best.FileId);
                            if (file != null && !string.IsNullOrWhiteSpace(file.FilePath))
                            {
                                return $"https://api.telegram.org/file/bot{token.Contact}/{file.FilePath}";
                            }
                        }
                    }
                    return null;

                case "Archivo":
                    if (message.File == null) throw new ArgumentNullException(nameof(message.File));
                    using (var stream = message.File.OpenReadStream())
                    {
                        var inputDoc = new InputFileStream(stream, message.File.FileName);
                        var tgMsg = await conexion.SendDocumentAsync(
                            chatId: phone,
                            document: inputDoc
                            //caption: message.Message
                        );
                        if (tgMsg.Document != null)
                        {
                            var file = await conexion.GetFileAsync(tgMsg.Document.FileId);
                            if (file != null && !string.IsNullOrWhiteSpace(file.FilePath))
                            {
                                return $"https://api.telegram.org/file/bot{token.Contact}/{file.FilePath}";
                            }
                        }
                    }
                    return null;
                case "Audio":
                    if (message.File == null) throw new ArgumentNullException(nameof(message.File));
                    using (var stream = message.File.OpenReadStream())
                    {
                        var inputAudio = new InputFileStream(stream, message.File.FileName);
                        var tgMsg = await conexion.SendAudioAsync(
                            chatId: phone,
                            audio: inputAudio
                            //caption: message.Message
                        );
                        if (tgMsg.Audio != null)
                        {
                            var file = await conexion.GetFileAsync(tgMsg.Audio.FileId);
                            if (file != null && !string.IsNullOrWhiteSpace(file.FilePath))
                            {
                                return $"https://api.telegram.org/file/bot{token.Contact}/{file.FilePath}";
                            }
                        }
                    }
                    return null;


                default:
                    throw new ArgumentOutOfRangeException(
                        $"Tipo de mensaje no soportado: {message.Type}");
            }
            }
            catch (Exception ex)
            {
                throw new Exception("Error enviando mensaje por Telegram", ex);
            }
            return null;
        }
        public async Task ArchivedChat(Guid idChat)
        {
            try
            {
                await CloseChat(idChat);
                await CloseClient(idChat);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al archivar", ex);
            }
        }
        public async Task CloseChat(Guid idChat)
        {
            try
            {
                var chat = await _context.Chats
                    .Include(c => c.Client)
                    .FirstOrDefaultAsync(c => c.Id == idChat);
                if (chat == null) throw new Exception("Chat no existente");

                chat.Status = "archived";

                await _context.SaveChangesAsync();

                // Notificar cambio de estado a través de SignalR
                var statusNotification = new ChatStatusNotification
                {
                    IdChat = chat.Id,
                    Status = "archived",
                    ClientName = chat.Client?.Name ?? "Sin nombre",
                    IdUser = chat.IdUser
                };
                await _hubContext.Clients.All.SendAsync("ChatStatusChanged", statusNotification);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al archivar", ex);
            }
        }
        public async Task CloseClient(Guid idChat)
        {
            try
            {
                var chat = await _context.Chats.FirstOrDefaultAsync(c => c.Id == idChat);
                if (chat == null) throw new Exception("Chat no existente");

                var client = await _context.Clients.FirstOrDefaultAsync(c => c.Id == chat.IdClient);

                client.Status = "closed";

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al archivar", ex);
            }
        }

        public async Task TransferChat(TransferChatRequest chat)
        {
            try
            {
                var chatResult = await _context.Chats.FirstOrDefaultAsync(c => c.Id == chat.IdChat);
                if (chatResult == null) throw new Exception("Chat no existente");
                var userResult = await _context.Users.FirstOrDefaultAsync(c => c.Id == chat.IdUser);
                if (userResult == null) throw new Exception("Usuario no existente");
                var clientResult = await _context.Clients.FirstOrDefaultAsync(c => c.Id == chatResult.IdClient);
                if (clientResult == null) throw new Exception("Cliente no existente");

                chatResult.IdUser = chat.IdUser;

                await _context.SaveChangesAsync();

                // Notificar transferencia de chat a través de SignalR
                await _hubContext.Clients.All.SendAsync("ChatTransferred", new 
                { 
                    ChatId = chat.IdChat, 
                    NewUserId = chat.IdUser,
                    UserName = userResult.UserName,
                    ClientName = clientResult.Name
                });



            }
            catch (Exception ex)
            {
                throw new Exception("Error al Transferir", ex);
            }
        }
    }
}
