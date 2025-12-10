import React from 'react';
import { Snackbar, Alert, AlertTitle, Box, Typography } from '@mui/material';

interface MessageNotificationProps {
  open: boolean;
  clientName: string;
  message: string;
  onClose: () => void;
}

/**
 * Componente para mostrar notificaciones de nuevos mensajes
 * Aparece con fondo blanco cuando llega un mensaje
 */
const MessageNotification: React.FC<MessageNotificationProps> = ({
  open,
  clientName,
  message,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity="info"
        icon={<span style={{ fontSize: '1.5rem' }}>💬</span>}
        sx={{
          width: '100%',
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>
          {clientName}
        </AlertTitle>
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default MessageNotification;

