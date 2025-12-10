using GestorConversaciones.DTO.Request.Calendar;
using GestorConversaciones.Services.Interface;
using Login.Routes;
using Microsoft.AspNetCore.Mvc;

namespace GestorConversaciones.Controllers
{
    public class CalendarController : Controller
    {
        private readonly ICalendarService _calendarService;
        public CalendarController(ICalendarService calendarService)
        {
            _calendarService = calendarService;
        }

        [HttpPost(ApiRoutes.Calendar.NewCalendar)]
        public async Task<IActionResult> NewCalendar([FromBody] NewCalendarRequest request)
        {
            var result = await _calendarService.NewCalendar(request);
            return Ok(result);
        }
        [HttpGet(ApiRoutes.Calendar.GetCalendar)]
        public async Task<IActionResult> GetCalendar()
        {
            var result = await _calendarService.GetCalendar();
            return Ok(result);
        }
        [HttpDelete(ApiRoutes.Calendar.DeleteCalendar)]
        public async Task<IActionResult> DeleteCalendar([FromRoute] Guid id)
        {
            var result = await _calendarService.DeleteCalendar(id);
            return Ok(result);
        }
        [HttpPatch(ApiRoutes.Calendar.EditCalendar)]
        public async Task<IActionResult> EditCalendar([FromBody] EditCalendarRequest request, [FromRoute] Guid id)
        {
            var result = await _calendarService.EditCalendar(request, id);
            return Ok(result);
        }
        [HttpGet(ApiRoutes.Calendar.GetByIdClient)]
        public async Task<IActionResult> GetByIdClientCalendar([FromRoute] Guid idClient)
        {
            var result = await _calendarService.GetByIdClientCalendar(idClient);
            return Ok(result);
        }
    }
}
