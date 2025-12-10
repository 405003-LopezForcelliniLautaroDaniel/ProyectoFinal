import React, { useEffect } from 'react';
import notificationService from '../../services/notificationService';

/**
 * Componente para activar notificaciones automáticamente
 * Ya no muestra un prompt, las solicita directamente al cargar
 */
const NotificationPrompt: React.FC = () => {
  useEffect(() => {
    // Solicitar permisos automáticamente al montar el componente
    const initNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await notificationService.requestPermission();
      }
    };
    
    initNotifications();
  }, []);

  // No renderizar nada, solo activa las notificaciones
  return null;
};

export default NotificationPrompt;

