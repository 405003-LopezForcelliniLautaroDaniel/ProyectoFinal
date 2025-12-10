import React, { useState } from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import { lineService } from '../../services/lineService';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import { extractApiErrorMessage } from '../../utils/apiError';

const LineCreateForm: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await lineService.createLine({ Name: name, Description: description || null });
      setName('');
      setDescription('');
      setSuccessOpen(true);
    } catch (err: any) {
      setErrorOpen(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || !name.trim();

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Nombre del área/rol"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
          margin="normal"
          required
          disabled={submitting}
        />
        <TextField
          fullWidth
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          margin="normal"
          disabled={submitting}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isDisabled}
          >
            {submitting ? 'Creando...' : 'Crear'}
          </Button>
        </Box>
      </form>
      
      <SuccessFeedback 
        open={successOpen} 
        message="Área/rol creado exitosamente" 
        onClose={() => setSuccessOpen(false)} 
      />
      <ErrorFeedback 
        open={!!errorOpen} 
        message={errorOpen || ''} 
        onClose={() => setErrorOpen(null)} 
      />
    </Paper>
  );
};

export default LineCreateForm;
