import React, { useState } from 'react';
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
import { Close as CloseIcon } from '@mui/icons-material';

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (description: string, dateTime: string) => void;
  clientName: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ open, onClose, onSave, clientName }) => {
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');

  const handleClose = () => {
    setDescription('');
    setDateTime('');
    onClose();
  };

  const handleSave = () => {
    if (!description.trim() || !dateTime) {
      return;
    }

    onSave(description.trim(), dateTime);
    handleClose();
  };

  // Establecer fecha mínima como ahora
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Agregar Nota/Recordatorio</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Cliente: <strong>{clientName}</strong>
          </Typography>

          <TextField
            label="Descripción"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe la nota o recordatorio..."
            multiline
            rows={3}
            required
            autoFocus
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
            inputProps={{
              min: minDateTime,
            }}
            required
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!description.trim() || !dateTime}
        >
          Guardar Nota
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteDialog;

