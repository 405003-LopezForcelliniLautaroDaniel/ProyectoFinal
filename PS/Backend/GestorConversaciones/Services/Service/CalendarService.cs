using GestorConversaciones.DTO.Request.Calendar;
using GestorConversaciones.DTO.Result.Calendar;
using GestorConversaciones.Helper;
using GestorConversaciones.Models;
using GestorConversaciones.Services.Interface;
using Login.DataBase;
using Microsoft.EntityFrameworkCore;

namespace GestorConversaciones.Services.Service
{
    public class CalendarService : ICalendarService
    {
        private readonly Context _contextDb;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CalendarService(Context contextDb, IHttpContextAccessor httpContextAccessor)
        {
            _contextDb = contextDb;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<NewCalendarResponse> NewCalendar(NewCalendarRequest request)
        {
            Guid societyId = _httpContextAccessor.HttpContext.GetIdCompany();
            Guid userId = _httpContextAccessor.HttpContext.GetIdUser();
            // Crear la entidad
            var calendarEntity = new Calendar
            {
                Description = request.Description,
                Time = request.Time,
                IdCompany = societyId,
                IdClient = request.IdClient,
                IdUser = userId
            };

            // Agregar al contexto
            _contextDb.Calendars.Add(calendarEntity);
            await _contextDb.SaveChangesAsync();

            // Mapear la respuesta
            var response = new NewCalendarResponse
            {
                Id = calendarEntity.Id,
                Description = calendarEntity.Description,
                Time = calendarEntity.Time,
                IdSociety = calendarEntity.IdCompany,
                IdUser = calendarEntity.IdUser,
            };

            return response;
        }
        public async Task<List<Calendar>> GetCalendar()
        {
            Guid societyId = _httpContextAccessor.HttpContext.GetIdCompany();
            Guid userId = _httpContextAccessor.HttpContext.GetIdUser();

            List<Calendar> eventList = await _contextDb.Calendars
                .Where(c => c.IdCompany == societyId && c.IdUser == userId)
                .AsNoTracking() // Mejora rendimiento y evita problemas de tracking
                .AsSplitQuery() // Divide las consultas para evitar problemas con JOINs y NULLs
                .Include(c => c.Company)  // Carga la compañía
                .Include(c => c.Client)   // Carga el cliente solo si IdClient no es null (automático)
                .ToListAsync();

            return eventList;
        }

        public async Task<Guid> DeleteCalendar(Guid id)
        {
            var calendar = await _contextDb.Calendars.FindAsync(id);
            if (calendar == null)
            {
                throw new KeyNotFoundException($"El calendario con ID {id} no fue encontrado.");
            }

            _contextDb.Calendars.Remove(calendar);
            await _contextDb.SaveChangesAsync();

            return id;
        }
        public async Task<NewCalendarResponse> EditCalendar(EditCalendarRequest request, Guid id)
        {
            var calendar = await _contextDb.Calendars.FindAsync(id);

            if (calendar == null)
            {
                throw new KeyNotFoundException($"El calendario con ID {id} no fue encontrado.");
            }

            if (request.Description != null)
            {
                calendar.Description = request.Description;
            }

            if (request.Time.HasValue)
            {
                calendar.Time = request.Time.Value;
            }

            await _contextDb.SaveChangesAsync();

            return new NewCalendarResponse
            {
                Id = calendar.Id,
                Description = calendar.Description,
                Time = calendar.Time,
                IdSociety = calendar.IdCompany,
                IdUser = calendar.IdUser,
            };
        }
        public async Task<List<Calendar>> GetByIdClientCalendar(Guid idClient)
        {
            Guid societyId = _httpContextAccessor.HttpContext.GetIdCompany();

            List<Calendar> eventList = await _contextDb.Calendars
                .Where(c => c.IdCompany == societyId && c.IdClient == idClient)
                .AsNoTracking() // Mejora rendimiento y evita problemas de tracking
                .AsSplitQuery() // Divide las consultas para evitar problemas con JOINs y NULLs
                .Include(c => c.Company)  // Carga la compañía
                .Include(c => c.Client)   // Carga el cliente solo si IdClient no es null (automático)
                .ToListAsync();

            return eventList;
        }
    }
}
