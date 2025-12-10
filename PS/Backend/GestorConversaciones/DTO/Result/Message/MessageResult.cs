namespace GestorConversaciones.DTO.Result.Message
{
    public class MessageResult
    {
        public Guid Id { get; set; }
        public Guid? IdUser { get; set; }
        public Guid? IdClient { get; set; }
        public Guid IdChat { get; set; }
        public int IdMessageType { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime Time { get; set; }
    }
}
