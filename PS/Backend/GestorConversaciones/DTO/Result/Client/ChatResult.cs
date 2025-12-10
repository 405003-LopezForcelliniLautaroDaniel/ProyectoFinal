namespace GestorConversaciones.DTO.Result.Client
{
    public class ChatResult
    {
        public Guid Id { get; set; }
        public string NameClient { get; set; }
        public string Status { get; set; }
        public string Contact { get; set; }
        public Guid? IdLine {  get; set; }
    }
}
