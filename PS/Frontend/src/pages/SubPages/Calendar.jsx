import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiRoutes } from '../../apiRoutes.ts';
import { getToken } from '../Login.jsx';
import { TextField, Button, Grid } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Typography from '@mui/material/Typography';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Nav from '../Nav.tsx';
import { Margin } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../Language/LanguageContext';

export var getClient = () => localStorage.getItem('client');
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function MyCalendar() {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme()
  const [events, setEvents] = useState([]);
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [newEventDescription, setNewEventDescription] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(apiRoutes.getCalendar.url, {
      method: apiRoutes.getCalendar.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const transformedEvents = data.map(event => {
          const transformedEvent = {
            id: event.id,
            title: event.description,
            start: new Date(event.time),
            end: new Date(event.time),
            allDay: false,
            idClient: event.client ? event.client.id : null,
            clientContact: event.client ? event.client.contact : null
          };

          return transformedEvent;
        });
        setEvents(transformedEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
    if (selectedEvent && selectedEvent.idClient) {
      localStorage.setItem('client', selectedEvent.idClient);
    } else {
      console.log('selectedEvent es null o no tiene la propiedad idClient');
    }
  }, []);


  const handleClientSelect = (idClient) => {
    if (idClient) {
      localStorage.setItem('client', idClient);  // Guarda el cliente en localStorage
      navigate(`/chat/telegram/${idClient}`);   // Redirige al componente de chat con el ID del cliente
    } else {
      console.error('ID del cliente no válido.');
    }
  };


  const handleAddEvent = () => {
    const token = getToken();
    fetch(apiRoutes.newCalendar.url, {
      method: apiRoutes.newCalendar.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time: newEventDate.toISOString(),
        description: newEventDescription
      })
    })
      .then(response => response.json())
      .then(newEvent => {
        setEvents([...events, {
          id: newEvent.id,
          title: newEventDescription,
          start: newEventDate,
          end: newEventDate,
          allDay: false
        }]);
        setNewEventDescription('');
        setNewEventDate(new Date());
      })
      .catch(error => console.error('Error adding new event:', error));
  };



  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setEditDescription(event.title);
    setEditTime(event.start);
    setOpenDialog(false);
    setOpenEditDialog(true);
  };

  const handleDeleteEvent = async (event) => {
    const eventId = event.id;
    const token = getToken();
    const deleteUrl = apiRoutes.deleteCalendar.url.replace('{id}', eventId);

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
        setOpenDialog(false);
      } else {
        throw new Error('Error al intentar eliminar el evento');
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };

  const handleSaveEdit = async () => {
    const eventId = selectedEvent.id;
    const token = getToken();
    const editUrl = apiRoutes.editCalendar.url.replace('{id}', eventId);

    if (!editDescription && !editTime) {
      alert("Debes proporcionar al menos una descripción o una hora.");
      return;
    }

    const body = {
      Description: editDescription || null,
      Time: editTime ? editTime.toISOString() : null
    };

    try {
      const response = await fetch(editUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        console.log("Evento editado con éxito");

        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, title: editDescription || event.title, start: editTime || event.start, end: editTime || event.end }
              : event
          )
        );

        setOpenEditDialog(false);
      } else {
        throw new Error('Error al intentar editar el evento');
      }
    } catch (error) {
      console.error("Error al editar el evento:", error);
    }
  };

  const dayPropGetter = (date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isCurrentMonth = date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();

    let backgroundColor = '';

    if (isToday) {
      backgroundColor = theme.palette.secondary.light; // Color para el día de hoy
    } else if (isCurrentMonth) {
      backgroundColor = theme.palette.secondary.main; // Color para los días del mes actual
    } else {
      backgroundColor = theme.palette.secondary.contrastText; // Color para los días que no son del mes actual
    }

    return {
      style: {
        backgroundColor,
      },
    };
  };


  // console.log(selectedEvent?.idClient)


  return (

    <box style={{ display: 'flex', height: '100vh', marginLeft: '5vh', marginRight: '2vh' }}>

      <LocalizationProvider dateAdapter={AdapterDateFns} locale={es} >

        <Nav />
        <Grid container spacing={2}>

          <Grid item xs={9}>
            <Typography variant="h6" marginTop={'2vh'} textAlign={'center'}>
              {translations.Calendar.Title}
            </Typography>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={event => {
                setSelectedEvent(event);
                setOpenDialog(true);
              }}
              messages={{
                next: translations.Calendar.Next,
                previous: translations.Calendar.Previous,
                today: translations.Calendar.Today,
                month: translations.Calendar.Month,
                week: translations.Calendar.Week,
                day: translations.Calendar.Day,
                agenda: translations.Calendar.Agenda,
              }}
              culture='es'
              dayPropGetter={dayPropGetter}
            />
          </Grid>
          <Grid
            item
            xs={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Centra horizontalmente
              marginTop: '10vh' 
            }}
          >
            <DateTimePicker
              label={translations.Calendar.DyT}
              value={newEventDate}
              onChange={setNewEventDate}
              renderInput={(params) => <TextField {...params} />}
              ampm={true}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              inputFormat="dd/MM/yyyy hh:mm a"
              sx={{ mt: '1rem' }}
            />
            <TextField
              label={translations.Calendar.Description}
              fullWidth
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              sx={{ mt: '1rem' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddEvent}
              sx={{ mt: '1rem', alignSelf: 'center' }} // Centrado adicional
            >
              {translations.Calendar.BtnAdd}
            </Button>
          </Grid>

        </Grid>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{translations.Calendar.Details}</DialogTitle>
          <DialogContent>
            {selectedEvent?.title && <Typography>{selectedEvent.title}</Typography>}
            {selectedEvent?.clientName && <Typography>Cliente: {selectedEvent.clientName}</Typography>}
            {selectedEvent?.clientContact && <Typography>Contacto: {selectedEvent.clientContact}</Typography>}
            {selectedEvent?.idClient && <Typography>ID Cliente: {selectedEvent.idClient}</Typography>}
          </DialogContent>
          <DialogActions>
            {selectedEvent?.idClient != null && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClientSelect(selectedEvent.idClient)}
              >
                Chat
              </Button>
            )}

            <Button onClick={() => handleEditEvent(selectedEvent)}>{translations.Calendar.BtnEdit}</Button>
            <Button onClick={() => handleDeleteEvent(selectedEvent)}>{translations.Calendar.BtnDelete}</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>{translations.Calendar.EditEvent}</DialogTitle>
          <DialogContent>
            <TextField
              label={translations.Calendar.Description}
              fullWidth
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              sx={{ mt: '1rem' }}
            />
            <DateTimePicker
              label={translations.Calendar.DyTE}
              value={editTime}
              onChange={setEditTime}
              renderInput={(params) => <TextField {...params} />}
              ampm={true}
              views={['year', 'month', 'day', 'hours', 'minutes']}
              inputFormat="dd/MM/yyyy hh:mm a"
              sx={{ mt: '1rem' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSaveEdit}>{translations.Calendar.BtnSave}</Button>
            <Button onClick={() => setOpenEditDialog(false)}>{translations.Calendar.BtnCancel}</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </box>
  );
}