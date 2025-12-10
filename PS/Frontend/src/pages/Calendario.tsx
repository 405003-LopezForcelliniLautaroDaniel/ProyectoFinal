import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import { View, SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarView from '../components/calendario/CalendarView';
import EventDialog from '../components/calendario/EventDialog';
import EventListPanel from '../components/calendario/EventListPanel';
import calendarService, { CalendarEvent } from '../services/calendarService';
import { extractApiErrorMessage } from '../utils/apiError';
import '../styles/calendar.css';

const Calendario: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estado del calendario
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Cargar eventos
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarService.getAllEvents();
      setEvents(data);
    } catch (err) {
      const errorMessage = extractApiErrorMessage(err);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Abrir diálogo para crear evento
  const handleCreateEvent = (date?: Date) => {
    setSelectedEvent(null);
    setInitialDate(date);
    setDialogOpen(true);
  };

  // Abrir diálogo para editar evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setInitialDate(undefined);
    setDialogOpen(true);
  };

  // Manejar selección de slot en el calendario
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    handleCreateEvent(slotInfo.start as Date);
  };

  // Guardar evento (crear o editar)
  const handleSaveEvent = async (eventData: { description: string; time: string }) => {
    try {
      if (selectedEvent) {
        // Editar evento existente
        await calendarService.updateEvent(selectedEvent.id, eventData);
        showSnackbar('Evento actualizado correctamente', 'success');
      } else {
        // Crear nuevo evento
        await calendarService.createEvent(eventData);
        showSnackbar('Evento creado correctamente', 'success');
      }
      await loadEvents();
      setDialogOpen(false);
    } catch (err) {
      const errorMessage = extractApiErrorMessage(err);
      showSnackbar(errorMessage, 'error');
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await calendarService.deleteEvent(selectedEvent.id);
      showSnackbar('Evento eliminado correctamente', 'success');
      await loadEvents();
      setDialogOpen(false);
    } catch (err) {
      const errorMessage = extractApiErrorMessage(err);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
    setInitialDate(undefined);
  };

  return (
    <>
      {loading && events.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
            {/* Vista del calendario */}
            <Grid item xs={12} lg={9} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <CalendarView
                  events={events}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  view={view}
                  onViewChange={setView}
                  date={date}
                  onNavigate={setDate}
                />
              </Paper>
            </Grid>

            {/* Panel lateral de eventos */}
            <Grid item xs={12} lg={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <EventListPanel
                events={events}
                onSelectEvent={handleSelectEvent}
                onCreateEvent={() => handleCreateEvent()}
                selectedEventId={selectedEvent?.id}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Diálogo para crear/editar evento */}
      <EventDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={initialDate}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Calendario;

