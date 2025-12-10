using Microsoft.AspNetCore.SignalR;
using System.Threading.Channels;
using Login.DataBase;
using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using GestorConversaciones.Models;
using Microsoft.EntityFrameworkCore;
using GestorConversaciones.Apis.Telegram.Service.Interface;
using Message = GestorConversaciones.Models.Message;
using Chat = GestorConversaciones.Models.Chat;
using TelegramMessage = Telegram.Bot.Types.Message;
using GestorConversaciones.Helper.Hubs;
using MessageType = Telegram.Bot.Types.Enums.MessageType;
using GestorConversaciones.DTO.SignalR;
using GestorConversaciones.Apis.Telegram.Models;
using Telegram.Bot.Types.ReplyMarkups;
using Channel = GestorConversaciones.Models.Channel;
using GestorConversaciones.Helper;
using GestorConversaciones.Services.Interface;
using static Login.Routes.ApiRoutes;

namespace GestorConversaciones.Apis.Telegram
{
    public class TelegramHelper : IHostedService
    {
        public List<TelegramBotConnection> _conexiones = new List<TelegramBotConnection>();
        public TelegramBotClient _conexion;
        public readonly IHubContext<ChatHub> _hubContext;
        public readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public TelegramHelper(IHubContext<ChatHub> hubContext, IServiceScopeFactory serviceScopeFactory, IHttpContextAccessor httpContextAccessor)

        //public TelegramHelper(IServiceScopeFactory serviceScopeFactory)
        {
            _hubContext = hubContext;
            _serviceScopeFactory = serviceScopeFactory;
            _httpContextAccessor = httpContextAccessor;
        }
        public List<TelegramBotClient> Conexiones => _conexiones.Select(c => c.BotClient).ToList();
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                var tokens = await ObtenerTokensDeBaseDeDatos();
                if (tokens.Any())
                {
                    foreach (var token in tokens)
                    {
                        try
                        {
                            var conexion = new TelegramBotClient(token);
                            _conexiones.Add(new TelegramBotConnection
                            {
                                BotClient = conexion,
                                Token = token
                            });
                            await AbrirConsola(conexion);
                            Conectar(conexion);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error al procesar el token {token}: {ex.Message}");
                        }
                    }
                }
                else
                {
                    throw new Exception("No se encontraron tokens en la base de datos.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al iniciar bots: {ex.Message}");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }


        private async Task<List<string>> ObtenerTokensDeBaseDeDatos()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<Context>();
                var bots = await dbContext.Channels
                    .ToListAsync();

                var tokens = bots.Select(b => b.Contact).Where(t => !string.IsNullOrEmpty(t)).ToList();

                Console.WriteLine($"Tokens obtenidos de la base de datos: {string.Join(", ", tokens)}");

                return tokens;
            }
        }

        private void Conectar(TelegramBotClient conexion)
        {
            var receiverOptions = new ReceiverOptions
            {
                AllowedUpdates = Array.Empty<UpdateType>()
            };
            conexion.StartReceiving(HandleUpdateAsync, HandleErrorAsync, receiverOptions, CancellationToken.None);
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        public async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
        {
            if (update.Type == UpdateType.Message && update.Message != null)
            {
                await HandleMessageUpdate(botClient, update.Message as TelegramMessage, cancellationToken);
            }
            else if (update.Type == UpdateType.CallbackQuery && update.CallbackQuery != null)
            {
                await HandleCallbackQueryUpdate(botClient, update.CallbackQuery, cancellationToken);
            }
        }

        private async Task HandleMessageUpdate(ITelegramBotClient botClient, TelegramMessage message, CancellationToken cancellationToken)
        {
            var chatId = message.Chat.Id;
            var chatName = message.Chat.FirstName;
            var hour = message.Date.ToUniversalTime();
            var messageText = message.Text;

            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Context>();

            var (corpId, channelId) = await GetChannelInfo(dbContext, botClient);
            var external = await GetOrCreateExternal(dbContext, chatId.ToString(), chatName, corpId);
            var (chatMember, isNewChat) = await GetOrCreateChatMember(scope, dbContext, external, botClient, chatId, cancellationToken);

            var messageType = DetermineMessageType(message);
            

            
            await SendNotificationToHub(hour, chatName, chatId, message, messageType, external, chatMember, botClient);

            switch (messageType)
            {
                case 1: // Texto
                    await SaveMessage(scope, channelId, messageType, chatMember, messageText);
                    break;

                case 2: // Imagen
                    var imageUrl = messageType.ToString();
                    string url = await UrlArchivo(hour, chatName, chatId, message, messageType, external, chatMember, botClient);
                    //var imageUrl = await ProcessAndUploadFile(botClient, message, messageType);
                    await SaveMessage(scope, channelId, messageType, chatMember, messageText, imageUrl: url);
                    break;

                case 3: // Archivo
                    var audioUrl = messageType.ToString();
                    string url2 = await UrlArchivo(hour, chatName, chatId, message, messageType, external, chatMember, botClient);

                    //var audioUrl = await ProcessAndUploadFile(botClient, message, messageType);
                    await SaveMessage(scope, channelId, messageType, chatMember, messageText, archivoUrl: url2);
                    break;



                case 4: // Audio
                    var archivoUrl = messageType.ToString();
                    string url3 = await UrlArchivo(hour, chatName, chatId, message, messageType, external, chatMember, botClient);

                    //var videoUrl = await ProcessAndUploadFile(botClient, message, messageType);
                    await SaveMessage(scope, channelId, messageType, chatMember, messageText, audioUrl: url3);
                    break;
            }
        }





        private async Task<(Chat chat, bool isNewChat)> GetOrCreateChatMember(
            IServiceScope scope,
            Context dbContext,
            Client external,
            ITelegramBotClient botClient,
            long chatId,
            CancellationToken cancellationToken)
        {
            // Obtener el IdChannel correspondiente al bot
            var channel = await GetChannelId(dbContext, botClient);

            // Verificar si ya existe un chat entre el cliente y la sociedad
            var existingChat = await dbContext.Chats
                .AsNoTracking()
                .Where(c => c.IdClient == external.Id && c.IdChannel == channel.Id)
                .Select(c => new Chat
                {
                    Id = c.Id,
                    IdClient = c.IdClient,
                    IdChannel = c.IdChannel,
                    IdCompany = c.IdCompany, // Guid? permite null
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    IdLine = c.IdLine,
                })
                    .OrderBy(x => x.CreatedAt)
                    .LastOrDefaultAsync();



            if (existingChat == null || existingChat.Status == "archived")
            {
                var chat = new Chat
                {
                    IdClient = external.Id,      
                    IdChannel = channel.Id,      
                    IdCompany = channel.IdCompany, 
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    IdLine = null
                };

                var saveDbService = scope.ServiceProvider.GetRequiredService<ISaveDb>();
                await saveDbService.GuardarChatsAsync(chat);

                await SendLinesToTelegram(chat, external);

                return (chat, true);
            }
            else
            {
                if (existingChat.IdLine == null)
                {
                    await SendLinesToTelegram(existingChat, external);


                    return (existingChat, false);
                }
                
                return (existingChat, false);
            }










            ////VER ACA DESPUES DE COMIDA
            //if (existingChat == null)
            //{
            //    if (existingChat.Status == "archived")
            //    {
            //        if (existingChat.IdUser == null)
            //        {

            //            await SendLinesToTelegram(existingChat, external);
            //            return (existingChat, false);
            //        }
            //        return (existingChat, false);
            //    }
            //}
            //    //VER ACA DESPUES DE COMIDA

            //    // Si no existe, crear uno nuevo
            //    var chat = new Chat
            //{
            //    IdClient = external.Id,      // Asignar el IdClient
            //    IdChannel = channel.Id,      // Asignar el IdChannel
            //    IdCompany = channel.IdCompany, // Puede ser null
            //    Status = "pending",
            //    CreatedAt = DateTime.UtcNow,
            //};

            //// Guardar el nuevo chat en la base de datos
            //var saveDbService = scope.ServiceProvider.GetRequiredService<ISaveDb>();
            //await saveDbService.GuardarChatsAsync(chat);

            //await SendLinesToTelegram(chat, external);
            //return (chat, true); // Retornar el nuevo chat creado y marcar como nuevo
        }
        public async Task SendLinesToTelegram(Chat chat, Client external)
        {

            try
            {
                string IdCompanyString = chat.IdCompany.ToString();
                // 🔹 1. Obtener las líneas desde la base de datos
                using var scope = _serviceScopeFactory.CreateScope();
                var lineService = scope.ServiceProvider.GetRequiredService<ILineService>();
                var lines = await lineService.GetAllLine(chat.IdCompany);


                if (lines == null || lines.Count == 0)
                {
                    // obtener el bot igual que en EnvioMensaje
                    var conexionVacia = Conexiones.FirstOrDefault();
                    if (conexionVacia != null)
                        await conexionVacia.SendTextMessageAsync(IdCompanyString, "No hay líneas disponibles.");
                    return;
                }

                // 🔹 2. Crear los botones inline dinámicamente
                var buttons = lines.Select(line =>
                    new[]
                    {
                InlineKeyboardButton.WithCallbackData(line.Name, $"LINE_{line.Id}")
                    }
                ).ToArray();

                var keyboard = new InlineKeyboardMarkup(buttons);

                // 🔹 3. Obtener el bot disponible
                var conexiones = Conexiones;
                var conexion = conexiones.FirstOrDefault();

                if (conexion == null)
                    throw new Exception("No hay conexiones de Telegram disponibles");

                // 🔹 4. Enviar el mensaje con los botones
                await conexion.SendTextMessageAsync(
                    chatId: external.Contact,
                    text: "Seleccione un area en la que desee ser atendido",
                    replyMarkup: keyboard,
                    cancellationToken: default
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar líneas a Telegram: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }






        private async Task<GestorConversaciones.Models.Channel> GetChannelId(Context dbContext, ITelegramBotClient botClient)
        {
            return await dbContext.Channels
            .Where(c => c.ObjectId == botClient.BotId)
            .FirstOrDefaultAsync();
        }

        private async Task SaveMessage(IServiceScope scope, Guid channelId, int messageType, Chat chatMember, string messageText, string audioUrl = null, string archivoUrl = null, string imageUrl = null, string videoUrl = null)
        {
            var messages = new Message
            {
                IdClient = chatMember?.IdClient ?? null,
                IdChat = chatMember.Id,
                Content = messageText,
                Time = DateTime.Now,
            };

            switch (messageType)
            {
                case 1: // Texto
                    messages.Content = messageText;
                    messages.IdMessageType = messageType;
                    break;
                case 2: // Image
                    messages.Content = imageUrl;
                    messages.IdMessageType = messageType;
                    break;
                case 3: // Archivo
                    messages.Content = archivoUrl;
                    messages.IdMessageType = messageType;
                    break;
                case 4: // Audio
                    messages.Content = audioUrl;
                    messages.IdMessageType = messageType;
                    break;
                case 5: // Video
                    messages.Content = videoUrl;
                    messages.IdMessageType = messageType;
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(messageType), $"Message type {messageType} is not supported.");
            }

            var saveDbMessage = scope.ServiceProvider.GetRequiredService<ISaveDb>();
            await saveDbMessage.GuardarMessageAsync(messages);
        }

        private async Task<(Guid societyId, Guid channelId)> GetChannelInfo(Context dbContext, ITelegramBotClient botClient)
        {
            var societyId = await dbContext.Channels
                .Where(c => c.ObjectId == botClient.BotId)
                .Select(c => c.IdCompany)
                .FirstOrDefaultAsync();

            var channelId = await dbContext.Channels
                .Where(c => c.ObjectId == botClient.BotId)
                .Select(c => c.Id)
                .FirstOrDefaultAsync();

            return (societyId, channelId);
        }

        private async Task<Client> GetOrCreateExternal(Context dbContext, string phone, string name, Guid corpId)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var external = await dbContext.Clients.FirstOrDefaultAsync(e => e.Contact == phone && e.IdCompany == corpId);
                if (external == null || external.Status != "closed")
                {
                    var newExternal = new Client
                    {
                        Contact = phone,
                        Name = name,
                        IdCompany = corpId,
                        Status = "in progress"
                    };
                    var saveDb = scope.ServiceProvider.GetRequiredService<ISaveDb>();
                    var externalId = await saveDb.GuardarExternalAsync(newExternal);
                    external = await dbContext.Clients.FindAsync(externalId);
                }
                return external;
            }
        }

        private int DetermineMessageType(TelegramMessage message)
        {
            return message.Type switch
            {
                MessageType.Text => 1,
                MessageType.Voice => 4,
                MessageType.Photo => 2,
                MessageType.Document => 3,
                _ => 1
            };
        }
        //HABLA CON EL CLIENTE - Envía notificación de nuevo mensaje
        private async Task SendNotificationToHub(
            DateTime hour,
            string chatName,
            long chatId,
            TelegramMessage message,
            int messageType,
            Client external,
            Chat chatMember,
            ITelegramBotClient botClient)
        {
            // Obtener el token del bot desde la base de datos
            string botToken = await GetBotTokenAsync(botClient);

            string content = messageType switch
            {
                1 => message.Text, // texto normal
                2 => message.Photo?.Last().FileId ?? "Imagen",
                3 => message.Document?.FileId ?? "Archivo",
                4 => message.Voice?.FileId ?? "Audio",
                _ => "Mensaje desconocido"
            };

            // Si el mensaje tiene archivo (foto, video o audio), obtenemos la URL real
            if (messageType is 2 or 3 or 4)
            {
                var fileId = content;
                var fileUrl = await GetTelegramFileUrlAsync(fileId, botToken);
                if (!string.IsNullOrEmpty(fileUrl))
                    content = fileUrl;
            }

            var notification = new NewMessageNotification
            {
                IdChat = chatMember.Id,
                IdUser = null,
                IdClient = external.Id,
                IdMessageType = messageType,
                Content = content, // ahora puede ser texto o una URL de Telegram
                Time = hour,
                ClientName = chatName
            };

            // SIGNALR Enviar notificación a todos los clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", notification);
        }

        private async Task<string> UrlArchivo(
    DateTime hour,
    string chatName,
    long chatId,
    TelegramMessage message,
    int messageType,
    Client external,
    Chat chatMember,
    ITelegramBotClient botClient)
        {
            // Obtener el token del bot desde la base de datos
            string botToken = await GetBotTokenAsync(botClient);

            string content = messageType switch
            {
                1 => message.Text, // texto normal
                2 => message.Photo?.Last().FileId ?? "Imagen",
                3 => message.Document?.FileId ?? "Archivo",
                4 => message.Voice?.FileId ?? "Audio",
                _ => "Mensaje desconocido"
            };

            // Si el mensaje tiene archivo (foto, video o audio), obtenemos la URL real
            if (messageType is 2 or 3 or 4)
            {
                var fileId = content;
                var fileUrl = await GetTelegramFileUrlAsync(fileId, botToken);
                if (!string.IsNullOrEmpty(fileUrl))
                    content = fileUrl;
            }

            return content;
        }

        private async Task<string> GetBotTokenAsync(ITelegramBotClient botClient)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Context>();
            
            var channel = await dbContext.Channels
                .Where(c => c.ObjectId == botClient.BotId)
                .FirstOrDefaultAsync();
                
            if (channel == null || string.IsNullOrEmpty(channel.Contact))
            {
                throw new InvalidOperationException($"No se encontró el token para el bot con ID: {botClient.BotId}");
            }
            
            return channel.Contact;
        }

        public async Task<string?> GetTelegramFileUrlAsync(string fileId, string botToken)
        {
            using var httpClient = new HttpClient();

            // 1️⃣ Obtener información del archivo
            string getFileUrl = $"https://api.telegram.org/bot{botToken}/getFile?file_id={fileId}";
            var response = await httpClient.GetAsync(getFileUrl);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonDocument.Parse(json);
            var filePath = result.RootElement.GetProperty("result").GetProperty("file_path").GetString();

            // 2️⃣ Construir la URL de descarga
            string fileUrl = $"https://api.telegram.org/file/bot{botToken}/{filePath}";
            return fileUrl;
        }


        // Método para notificar un nuevo chat
        private async Task NotifyNewChat(Chat chat, Client client)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Context>();

            // Obtener usuarios que pertenecen a la línea del chat
            var userIds = await dbContext.LineUsers
                .Where(lu => lu.IdLine == chat.IdLine && lu.Status == true)
                .Select(lu => lu.IdUser.ToString())
                .ToListAsync();

            var notification = new NewChatNotification
            {
                IdChat = chat.Id,
                IdClient = chat.IdClient,
                IdCompany = chat.IdCompany,
                ClientName = client.Name,
                Status = chat.Status,
                Contact = client.Contact,
                CreatedAt = DateTime.UtcNow,
                IdLine = chat.IdLine,
            };

            // Enviar el chat SOLO a usuarios de esa línea específica
            foreach (var userId in userIds)
            {
                await _hubContext.Clients.User(userId).SendAsync("NewChat", notification);
            }
        }

        private async Task HandleCallbackQueryUpdate(ITelegramBotClient botClient, CallbackQuery callbackQuery, CancellationToken cancellationToken)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Context>();

            var (corpId, channelId) = await GetChannelInfo(dbContext, botClient);

            var telegramChatId = callbackQuery.Message.Chat.Id.ToString();
            string response = await ProcessCallbackQuery(telegramChatId, callbackQuery.Data, corpId);

            await SendCallbackResponses(botClient, callbackQuery, response, cancellationToken);
        }

        private async Task<string> ProcessCallbackQuery(string telegramChatId, string callbackData, Guid corpId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Context>();

            // 🔹 Intentar obtener el GUID que viene después de "LINE_"
            Guid lineId = Guid.Empty;
            if (callbackData.StartsWith("LINE_"))
            {
                var lineIdString = callbackData.Substring("LINE_".Length);
                Guid.TryParse(lineIdString, out lineId);
            }

            var external = await dbContext.Clients.FirstOrDefaultAsync(e => e.Contact == telegramChatId && e.IdCompany == corpId);
            if (external == null) return "No se encontró el usuario externo";

            var chat = await dbContext.Chats
                .Where(cm => cm.IdClient == external.Id)
                .OrderBy(x => x.CreatedAt)
                .LastOrDefaultAsync();

            chat.IdLine = lineId;

            var line = await dbContext.Lines.FirstOrDefaultAsync(l => l.Id == lineId);

            await dbContext.SaveChangesAsync();


            await NotifyNewChat(chat, external);

            // 🔹 Podés usar lineId normalmente
            return $"Usted será atendido por el área {line.Name}";
        }



        private async Task SendCallbackResponses(ITelegramBotClient botClient, CallbackQuery callbackQuery, string response, CancellationToken cancellationToken)
        {
            await botClient.AnswerCallbackQueryAsync(
                callbackQueryId: callbackQuery.Id,
                cancellationToken: cancellationToken
            );

            await botClient.SendTextMessageAsync(
                chatId: callbackQuery.Message.Chat.Id,
                text: response,
                cancellationToken: cancellationToken
            );

            await botClient.EditMessageReplyMarkupAsync(
                chatId: callbackQuery.Message.Chat.Id,
                messageId: callbackQuery.Message.MessageId,
                cancellationToken: cancellationToken
            );
        }


        private static Task HandleErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
        {
            Console.WriteLine($"An error occurred: {exception.Message}");

            if (exception.StackTrace != null)
            {
                Console.WriteLine($"StackTrace: {exception.StackTrace}");
            }

            if (exception.InnerException != null)
            {
                Console.WriteLine("Inner Exception:");
                Console.WriteLine($"Message: {exception.InnerException.Message}");

                if (exception.InnerException.StackTrace != null)
                {
                    Console.WriteLine($"Inner StackTrace: {exception.InnerException.StackTrace}");
                }
            }

            return Task.CompletedTask;
        }


        public async Task AbrirConsola(TelegramBotClient conexion)
        {
            if (conexion == null)
            {
                throw new InvalidOperationException("El cliente de Telegram no está inicializado.");
            }

            var me = await conexion.GetMeAsync();
            Console.WriteLine($"Bot id: {me.Id} Bot name: {me.FirstName}");
        }
    }
}
