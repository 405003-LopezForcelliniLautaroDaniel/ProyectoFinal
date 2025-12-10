namespace GestorConversaciones.DTO.Request.Pay
{
    public class WebhookNotification
    {
        public string Action { get; set; }
        public string ApiVersion { get; set; }
        public WebhookData Data { get; set; }
        public DateTime DateCreated { get; set; }
        public long Id { get; set; }
        public bool LiveMode { get; set; }
        public string Type { get; set; }
        public string UserId { get; set; }
    }

    public class WebhookData
    {
        public string Id { get; set; }
    }
}

