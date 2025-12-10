import React from 'react';
import { Box, Chip } from '@mui/material';
import { useSignalR } from '../../contexts/SignalRContext';
import { HubConnectionState } from '@microsoft/signalr';

/**
 * Componente para mostrar el estado de conexión de SignalR
 * Útil para desarrollo y debugging
 */
const SignalRStatus: React.FC = () => {
  const { isConnected, connectionState } = useSignalR();

  const getStatusColor = () => {
    switch (connectionState) {
      case HubConnectionState.Connected:
        return 'success';
      case HubConnectionState.Connecting:
      case HubConnectionState.Reconnecting:
        return 'warning';
      case HubConnectionState.Disconnected:
      case HubConnectionState.Disconnecting:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (connectionState) {
      case HubConnectionState.Connected:
        return 'Conectado';
      case HubConnectionState.Connecting:
        return 'Conectando...';
      case HubConnectionState.Reconnecting:
        return 'Reconectando...';
      case HubConnectionState.Disconnected:
        return 'Desconectado';
      case HubConnectionState.Disconnecting:
        return 'Desconectando...';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Chip
        label={`SignalR: ${getStatusLabel()}`}
        color={getStatusColor()}
        size="small"
        variant={isConnected ? 'filled' : 'outlined'}
      />
    </Box>
  );
};

export default SignalRStatus;

