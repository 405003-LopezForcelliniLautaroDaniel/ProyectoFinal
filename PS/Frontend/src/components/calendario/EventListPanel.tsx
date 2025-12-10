import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Event as EventIcon, Close as CloseIcon } from '@mui/icons-material';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';

interface EventListPanelProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEvent: () => void;
  selectedEventId?: string;
}

const MAX_VISIBLE_EVENTS = 3;

const EventListPanel: React.FC<EventListPanelProps> = ({
  events,
  onSelectEvent,
  onCreateEvent,
  selectedEventId,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'upcoming' | 'past' | null>(null);

  // Ordenar eventos por fecha
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  }, [events]);

  // Agrupar eventos
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: CalendarEvent[] = [];
    const past: CalendarEvent[] = [];

    sortedEvents.forEach(event => {
      const eventDate = new Date(event.time);
      if (isFuture(eventDate) || isToday(eventDate)) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [sortedEvents]);

  // Limitar eventos visibles
  const visibleUpcomingEvents = useMemo(() => {
    return upcomingEvents.slice(0, MAX_VISIBLE_EVENTS);
  }, [upcomingEvents]);

  const visiblePastEvents = useMemo(() => {
    return pastEvents.slice(0, MAX_VISIBLE_EVENTS);
  }, [pastEvents]);

  const hasMoreUpcoming = upcomingEvents.length > MAX_VISIBLE_EVENTS;
  const hasMorePast = pastEvents.length > MAX_VISIBLE_EVENTS;

  const handleOpenDialog = (type: 'upcoming' | 'past') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType(null);
  };

  const handleDialogEventClick = (event: CalendarEvent) => {
    onSelectEvent(event);
    handleCloseDialog();
  };

  const getEventDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Hoy';
    }
    if (isTomorrow(date)) {
      return 'Mañana';
    }
    if (isPast(date)) {
      return format(date, "dd 'de' MMMM", { locale: es });
    }
    return format(date, "dd 'de' MMMM", { locale: es });
  };

  const getEventTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: es });
  };

  const renderEventItem = (event: CalendarEvent, inDialog: boolean = false) => {
    const isSelected = event.id === selectedEventId;
    const isPastEvent = isPast(new Date(event.time)) && !isToday(new Date(event.time));

    return (
      <ListItem key={event.id} disablePadding>
        <ListItemButton
          selected={isSelected}
          onClick={() => inDialog ? handleDialogEventClick(event) : onSelectEvent(event)}
          sx={{
            borderLeft: isSelected ? '4px solid #1976d2' : '4px solid transparent',
            opacity: isPastEvent ? 0.6 : 1,
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: isSelected ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {event.description}
                </Typography>
                {isPastEvent && (
                  <Chip label="Pasado" size="small" color="default" sx={{ flexShrink: 0 }} />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ mt: 0.5 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  <EventIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  {getEventDateLabel(event.time)} a las {getEventTimeLabel(event.time)}
                </Typography>
                {event.client && (
                  <Typography 
                    variant="caption" 
                    display="block" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Cliente: {event.client.name}
                  </Typography>
                )}
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #e0e0e0',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>
          Notas
        </Typography>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onCreateEvent}
        >
          Nueva Nota
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, maxHeight: '100%' }}>
        {events.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100%',
              p: 3,
              textAlign: 'center',
            }}
          >
            <EventIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No hay notas programadas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Crea tu primera nota haciendo clic en el botón de arriba
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'min-content' }}>
            {upcomingEvents.length > 0 && (
              <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Próximos ({upcomingEvents.length})
                  </Typography>
                  {hasMoreUpcoming && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog('upcoming')}
                      sx={{ minWidth: 'auto', px: 1.5 }}
                    >
                      Ver más ({upcomingEvents.length - MAX_VISIBLE_EVENTS})
                    </Button>
                  )}
                </Box>
                <List dense disablePadding>
                  {visibleUpcomingEvents.map(event => renderEventItem(event, false))}
                </List>
              </Box>
            )}

            {pastEvents.length > 0 && (
              <Box sx={{ flexShrink: 0 }}>
                <Divider sx={{ mt: upcomingEvents.length > 0 ? 2 : 0 }} />
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pasados ({pastEvents.length})
                  </Typography>
                  {hasMorePast && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog('past')}
                      sx={{ minWidth: 'auto', px: 1.5 }}
                    >
                      Ver más ({pastEvents.length - MAX_VISIBLE_EVENTS})
                    </Button>
                  )}
                </Box>
                <List dense disablePadding>
                  {visiblePastEvents.map(event => renderEventItem(event, false))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Diálogo para ver lista completa */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {dialogType === 'upcoming' ? 'Próximas Notas' : 'Notas Pasadas'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ overflow: 'auto' }}>
          <List dense>
            {dialogType === 'upcoming' 
              ? upcomingEvents.map(event => renderEventItem(event, true))
              : pastEvents.map(event => renderEventItem(event, true))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EventListPanel;

