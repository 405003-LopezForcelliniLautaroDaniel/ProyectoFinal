import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { extractApiErrorMessage } from '../../utils/apiError';
import portadaImg from '../../img/Portada.jpg';
import logoImg from '../../img/logo.png';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await login({ UserName: username, Password: password });
    } catch (err: any) {
      // Usar extractApiErrorMessage para obtener el mensaje correcto
      const errorMsg = err.message || extractApiErrorMessage(err) || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${portadaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 450, 
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img 
              src={logoImg} 
              alt="Logo" 
              style={{ 
                height: 80, 
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </Box>

          {/* Título */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ 
              mb: 1, 
              fontWeight: 600,
              color: '#1976d2'
            }}
          >
            Bienvenido
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 3, color: 'text.secondary' }}
          >
            Inicia sesión para continuar
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ 
                mt: 3, 
                mb: 2,
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.6)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;


