import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo, Event } from 'react-big-calendar';
import { format as dateFnsFormat, parse as dateFnsParse, startOfWeek as dateFnsStartOfWeek, getDay as dateFnsGetDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Box } from '@mui/material';
import { CalendarEvent, CalendarViewEvent } from '../../types/calendar';

const locales = {
  es: es,
};

// Adaptar las funciones de date-fns para el localizer
const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string, culture?: string) => {
    return dateFnsFormat(date, formatStr, {
      locale: culture && locales[culture as keyof typeof locales] ? locales[culture as keyof typeof locales] : es,
    });
  },
  parse: (dateString: string, formatStr: string, culture?: string) => {
    return dateFnsParse(dateString, formatStr, new Date(), {
      locale: culture && locales[culture as keyof typeof locales] ? locales[culture as keyof typeof locales] : es,
    });
  },
  startOfWeek: (culture?: string) => {
    const locale = culture && locales[culture as keyof typeof locales] ? locales[culture as keyof typeof locales] : es;
    return locale.options?.weekStartsOn || 0;
  },
  getDay: (date: Date) => {
    return dateFnsGetDay(date);
  },
  locales,
});

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  view: View;
  onViewChange: (view: View) => void;
  date: Date;
  onNavigate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onSelectSlot,
  view,
  onViewChange,
  date,
  onNavigate,
}) => {
  // Convertir eventos del backend al formato del calendario
  const calendarEvents: CalendarViewEvent[] = useMemo(() => {
    return events.map(event => {
      const eventDate = new Date(event.time);
      return {
        id: event.id,
        title: event.description,
        start: eventDate,
        end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hora de duración por defecto
        resource: event,
      };
    });
  }, [events]);

  const handleSelectEvent = (event: Event) => {
    const calendarEvent = calendarEvents.find(e => e.id === event.id);
    if (calendarEvent && calendarEvent.resource) {
      onSelectEvent(calendarEvent.resource);
    }
  };

  // Mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver más (${total})`,
  };

  // Formato personalizado para fechas en agenda
  const formats = {
    agendaDateFormat: "EEEE d 'de' MMMM 'de' yyyy", // "Viernes 7 de Noviembre de 2025"
  };

  // Estilos personalizados para los eventos
  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#1976d2',
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
      },
    };
  };

  return (
    <Box
      sx={{
        height: '100%',
        '& .rbc-calendar': {
          height: '100%',
        },
        '& .rbc-header': {
          padding: '10px 3px',
          fontWeight: 600,
          fontSize: '0.9rem',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0',
        },
        '& .rbc-today': {
          backgroundColor: '#e3f2fd',
        },
        '& .rbc-event': {
          padding: '2px 5px',
        },
        '& .rbc-toolbar button': {
          color: '#1976d2',
          border: '1px solid #1976d2',
          '&:hover': {
            backgroundColor: '#e3f2fd',
          },
          '&:active, &.rbc-active': {
            backgroundColor: '#1976d2',
            color: 'white',
          },
        },
      }}
    >
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        messages={messages}
        formats={formats}
        culture="es"
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        eventPropGetter={eventStyleGetter}
        popup
      />
    </Box>
  );
};

export default CalendarView;

