namespace GestorConversaciones.DTO.SignalR
{
    public class NewMessageNotification
    {
        public Guid IdChat { get; set; }
        public Guid? IdUser { get; set; }
        public Guid? IdClient { get; set; }
        public int IdMessageType { get; set; }
        public string Content { get; set; }
        public DateTime Time { get; set; }
        public string ClientName { get; set; }
    }
}

