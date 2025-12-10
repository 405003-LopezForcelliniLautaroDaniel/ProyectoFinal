namespace GestorConversaciones.DTO.SignalR
{
    public class NewChatNotification
    {
        public Guid IdChat { get; set; }
        public Guid IdClient { get; set; }
        public Guid IdCompany { get; set; }
        public string ClientName { get; set; }
        public string Status { get; set; }
        public string Contact { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? IdLine {  get; set; }
    }
}

