import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, lines, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInicio = () => {
    navigate('/inicio');
  };

  const handleGestionar = () => {
    navigate('/gestionar');
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1976d2', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Lado izquierdo - Inicio (para todos) */}
        <Typography
          variant="h6"
          component="div"
          onClick={handleInicio}
          sx={{ 
            flexGrow: 0,
            mr: 4,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          Inicio
        </Typography>

        {/* Espaciador para empujar el contenido a la derecha */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Lado derecho - Opciones según rol */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user?.rol ? (
            // Opciones para administrador (true)
            <>
              <Button
                color="inherit"
                onClick={handleGestionar}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Gestionar
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Dashboard
              </Button>
            </>
          ) : (
            // Opciones para usuario normal (false)
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/calendario')}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Calendario
              </Button>
              <Button
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                onClick={() => navigate('/chats')}
              >
                Chat
              </Button>
            </>
          )}

          {/* Información del usuario y logout */}
          <Tooltip 
            title={
              lines.length > 0 ? (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Areas/Roles asignadas:
                  </Typography>
                  {lines.map((line, index) => (
                    <Typography key={line.id} variant="body2" sx={{ fontSize: '0.85rem' }}>
                      • {line.name}
                    </Typography>
                  ))}
                </Box>
              ) : 'Sin áreas asignadas'
            }
            arrow
            placement="bottom"
          >
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2, 
                alignSelf: 'center',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                }
              }}
            >
              {user?.userName || user?.firstName || 'Usuario'}
            </Typography>
          </Tooltip>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;


