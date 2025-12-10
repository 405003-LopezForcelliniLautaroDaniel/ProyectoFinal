import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { ApiLine, UpdateLineDto, lineService } from '../../services/lineService';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import { extractApiErrorMessage } from '../../utils/apiError';

interface Props {
  open: boolean;
  line: ApiLine | null;
  onClose: () => void;
  onUpdated: (updated: ApiLine) => void;
}

const LineEditDialog: React.FC<Props> = ({ open, line, onClose, onUpdated }) => {
  const [name, setName] = useState('');
  const [errorName, setErrorName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  useEffect(() => {
    if (open && line) {
      setName(line.name || '');
      setErrorName('');
      setDescription(line.description || '');
    }
  }, [open, line]);

  const validate = () => {
    if (!name.trim()) {
      setErrorName('Requerido');
      return false;
    }
    setErrorName('');
    return true;
  };

  const handleSave = async () => {
    if (!line) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: UpdateLineDto = { Id: line.id, Name: name, Description: description || null };
      const updated = await lineService.updateLine(payload);
      setSuccessOpen(true);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorOpen(extractApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Editar área/rol</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errorName}
            helperText={errorName}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <SuccessFeedback open={successOpen} message="Área/rol actualizado" onClose={() => setSuccessOpen(false)} />
      <ErrorFeedback open={!!errorOpen} message={errorOpen || ''} onClose={() => setErrorOpen(null)} />
    </>
  );
};

export default LineEditDialog;


