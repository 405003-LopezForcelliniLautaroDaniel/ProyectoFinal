namespace GestorConversaciones.DTO.Request.Calendar
{
    public class NewCalendarRequest
    {
        public string Description { get; set; }
        public DateTime Time { get; set; }
        public Guid? IdClient { get; set; }
    }
}
