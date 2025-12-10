using GestorConversaciones.Apis.Telegram.Models;
using GestorConversaciones.DTO.Request.Chat;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    [Authorize]
    [ApiController]
    public class ChatController : Controller
    {
        private readonly IChatService _chatService;
        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet(ApiRoutes.Chat.GetAllChat)]
        public async Task<IActionResult> GetAllChat()
        {
            try
            {
                var result = await _chatService.GetAllChat();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet(ApiRoutes.Chat.GetChat)]
        public async Task<IActionResult> GetChat([FromRoute] Guid id)
        {
            try
            {
                var result = await _chatService.GetChat(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost(ApiRoutes.Chat.SendMessage)]
        public async Task<IActionResult> SendMessage(
            [FromForm(Name = "Message")] string? messageText,
            [FromForm(Name = "Type")] string? type,
            [FromForm(Name = "IdChat")] Guid idChat,
            [FromForm(Name = "File")] IFormFile? file)
        {
            try
            {
                var dto = new SendMessageRequest
                {
                    Message = messageText ?? string.Empty,
                    Type = string.IsNullOrWhiteSpace(type) ? "Texto" : type,
                    IdChat = idChat,
                    File = file
                };

                var result = await _chatService.SendMessage(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut(ApiRoutes.Chat.Archived)]
        public async Task<IActionResult> ArchivedChat([FromRoute] Guid idChat)
        {
            try
            {
                await _chatService.ArchivedChat(idChat);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut(ApiRoutes.Chat.Transfer)]
        public async Task<IActionResult> TransferChat([FromBody] TransferChatRequest chat)
        {
            try
            {
                await _chatService.TransferChat(chat);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
