namespace GestorConversaciones.DTO.Result.Calendar
{
    public class NewCalendarResponse
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public DateTime Time { get; set; }
        public Guid IdSociety { get; set; }
        public Guid? IdClient { get; set; }
        public Guid? IdUser { get; set; }
    }
}
