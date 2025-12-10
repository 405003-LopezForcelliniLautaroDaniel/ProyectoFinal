import React, { useState } from 'react';
import { Box, Button, Grid, Paper, TextField } from '@mui/material';
import { SuccessFeedback, ErrorFeedback } from '../general/Feedback';
import { userService } from '../../services/userService';
import { extractApiErrorMessage } from '../../utils/apiError';

const initial = {
  firstName: '',
  lastName: '',
  userName: '',
  password: '',
  confirmPassword: '',
  email: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserCreateForm: React.FC = () => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<{[k: string]: string}>({});
  const [touched, setTouched] = useState<{[K in keyof typeof initial]?: boolean}>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);

  const validate = () => {
    const e: {[k: string]: string} = {};
    if (!form.firstName.trim()) e.firstName = 'Requerido';
    if (!form.lastName.trim()) e.lastName = 'Requerido';
    if (!form.userName.trim()) e.userName = 'Requerido';
    if (!form.password.trim()) e.password = 'Requerido';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    if (!form.email.trim()) e.email = 'Requerido';
    else if (!emailRegex.test(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Revalidar SIEMPRE en cada cambio para habilitar/deshabilitar el botón en tiempo real
      setTimeout(() => validate(), 0);
      return next;
    });
  };

  const onBlur = (field: keyof typeof form) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await userService.createUser({
        FirstName: form.firstName,
        LastName: form.lastName,
        UserName: form.userName,
        Password: form.password,
        Email: form.email,
      });
      setForm(initial);
      setSuccessOpen(true);
    } catch (err: any) {
      // Capturar errores del backend y mostrar su mensaje real
      setErrorOpen(extractApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormFilled =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.userName.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.confirmPassword.trim();
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Paper sx={{ p: 2 }}>
      <form onSubmit={onSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="FirstName" fullWidth value={form.firstName} onChange={onChange('firstName')} onBlur={onBlur('firstName')} error={!!errors.firstName && !!touched.firstName} helperText={touched.firstName ? errors.firstName : ''} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="LastName" fullWidth value={form.lastName} onChange={onChange('lastName')} onBlur={onBlur('lastName')} error={!!errors.lastName && !!touched.lastName} helperText={touched.lastName ? errors.lastName : ''} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="UserName" fullWidth value={form.userName} onChange={onChange('userName')} onBlur={onBlur('userName')} error={!!errors.userName && !!touched.userName} helperText={touched.userName ? errors.userName : ''} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Email" fullWidth value={form.email} onChange={onChange('email')} onBlur={onBlur('email')} error={!!errors.email && !!touched.email} helperText={touched.email ? errors.email : ''} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Password" type="password" fullWidth value={form.password} onChange={onChange('password')} onBlur={onBlur('password')} error={!!errors.password && !!touched.password} helperText={touched.password ? errors.password : ''} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Confirm Password" type="password" fullWidth value={form.confirmPassword} onChange={onChange('confirmPassword')} onBlur={onBlur('confirmPassword')} error={!!errors.confirmPassword && !!touched.confirmPassword} helperText={touched.confirmPassword ? errors.confirmPassword : ''} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={submitting || hasErrors || !isFormFilled}>Crear</Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      <SuccessFeedback open={successOpen} message="Usuario creado exitosamente" onClose={() => setSuccessOpen(false)} />
      <ErrorFeedback open={!!errorOpen} message={errorOpen || ''} onClose={() => setErrorOpen(null)} />
    </Paper>
  );
};

export default UserCreateForm;


