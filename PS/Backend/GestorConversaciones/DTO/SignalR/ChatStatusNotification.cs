namespace GestorConversaciones.DTO.SignalR
{
    public class ChatStatusNotification
    {
        public Guid IdChat { get; set; }
        public string Status { get; set; }
        public string ClientName { get; set; }
        public Guid? IdUser { get; set; }
    }
}

