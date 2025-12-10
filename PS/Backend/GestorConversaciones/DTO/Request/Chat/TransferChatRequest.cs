namespace GestorConversaciones.DTO.Request.Chat
{
    public class TransferChatRequest
    {
        public Guid IdChat { get; set; }
        public Guid IdUser { get; set; }
    }
}
