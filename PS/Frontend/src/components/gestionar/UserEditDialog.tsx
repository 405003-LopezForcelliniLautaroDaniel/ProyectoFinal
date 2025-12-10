import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField } from '@mui/material';
import { ApiUser, UpdateUserDto, userService } from '../../services/userService';
import { extractApiErrorMessage } from '../../utils/apiError';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';

interface Props {
  open: boolean;
  user: ApiUser | null;
  onClose: () => void;
  onUpdated: (updated: ApiUser) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserEditDialog: React.FC<Props> = ({ open, user, onClose, onUpdated }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[k: string]: string}>({});
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [open, user]);

  const validate = () => {
    const e: {[k: string]: string} = {};
    if (!firstName.trim()) e.firstName = 'Requerido';
    if (!lastName.trim()) e.lastName = 'Requerido';
    if (!email.trim()) e.email = 'Requerido';
    else if (!emailRegex.test(email)) e.email = 'Email inválido';
    // password opcional: validar solo si se ingresó algo
    if (password.trim()) {
      if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: UpdateUserDto = {
        Id: user.id,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Password: password.trim() ? password : null,
      };
      const updated = await userService.updateUser(payload);
      setSuccessOpen(true);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setErrorOpen(extractApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="FirstName" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} error={!!errors.firstName} helperText={errors.firstName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="LastName" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} error={!!errors.lastName} helperText={errors.lastName} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password || 'Dejar vacío para no cambiar la contraseña'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword || (password ? 'Repite la nueva contraseña' : 'Sin cambio de contraseña')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isDisabled}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={isDisabled}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <SuccessFeedback open={successOpen} message="Usuario actualizado" onClose={() => setSuccessOpen(false)} />
      <ErrorFeedback open={!!errorOpen} message={errorOpen || ''} onClose={() => setErrorOpen(null)} />
    </>
  );
};

export default UserEditDialog;


