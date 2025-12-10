import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CalendarEvent } from '../../types/calendar';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (eventData: { description: string; time: string }) => void;
  onDelete?: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
}) => {
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    if (event) {
      // Modo edición
      setDescription(event.description);
      const eventDate = new Date(event.time);
      const formattedDate = eventDate.toISOString().slice(0, 16);
      setDateTime(formattedDate);
    } else if (initialDate) {
      // Modo creación con fecha inicial
      const formattedDate = initialDate.toISOString().slice(0, 16);
      setDateTime(formattedDate);
      setDescription('');
    } else {
      // Modo creación sin fecha
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 16);
      setDateTime(formattedDate);
      setDescription('');
    }
  }, [event, initialDate, open]);

  const handleSave = () => {
    if (!description.trim() || !dateTime) {
      return;
    }

    const isoDateTime = new Date(dateTime).toISOString();
    onSave({
      description: description.trim(),
      time: isoDateTime,
    });

    handleClose();
  };

  const handleClose = () => {
    setDescription('');
    setDateTime('');
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      handleClose();
    }
  };

  const isEditMode = !!event;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditMode ? 'Editar Evento' : 'Nuevo Evento'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Descripción"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingresa una descripción del evento"
            multiline
            rows={3}
            required
          />

          <TextField
            label="Fecha y Hora"
            type="datetime-local"
            fullWidth
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Box>
          {isEditMode && onDelete && (
            <Button
              onClick={handleDelete}
              color="error"
              startIcon={<DeleteIcon />}
              variant="outlined"
            >
              Eliminar
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!description.trim() || !dateTime}
          >
            {isEditMode ? 'Guardar' : 'Crear'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;

