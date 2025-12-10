using GestorConversaciones.DTO.Request.Calendar;
using GestorConversaciones.DTO.Result.Calendar;
using GestorConversaciones.Models;

namespace GestorConversaciones.Services.Interface
{
    public interface ICalendarService
    {
        Task<NewCalendarResponse> NewCalendar(NewCalendarRequest request);
        Task<List<Calendar>> GetCalendar();
        Task<Guid> DeleteCalendar(Guid id);
        Task<NewCalendarResponse> EditCalendar(EditCalendarRequest request, Guid id);
        Task<List<Calendar>> GetByIdClientCalendar(Guid idClient);
    }
}
