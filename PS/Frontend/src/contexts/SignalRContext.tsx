import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import signalRService from '../services/signalRService';
import { HubConnectionState } from '@microsoft/signalr';

interface SignalRContextType {
  isConnected: boolean;
  connectionState: HubConnectionState | null;
  startConnection: () => Promise<void>;
  stopConnection: () => Promise<void>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  off: (eventName: string, callback?: (...args: any[]) => void) => void;
  invoke: <T = any>(methodName: string, ...args: any[]) => Promise<T>;
  send: (methodName: string, ...args: any[]) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
  hubUrl?: string;
  autoConnect?: boolean;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ 
  children, 
  hubUrl = 'http://localhost:5000/chathub', // URL por defecto, ajustar según tu backend
  autoConnect = true 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null);

  const startConnection = useCallback(async () => {
    try {
      await signalRService.startConnection(hubUrl);
      setIsConnected(signalRService.isConnected());
      setConnectionState(signalRService.getConnectionState());
    } catch (error) {
      console.error('Error al iniciar conexión SignalR:', error);
      setIsConnected(false);
    }
  }, [hubUrl]);

  const stopConnection = useCallback(async () => {
    try {
      await signalRService.stopConnection();
      setIsConnected(false);
      setConnectionState(null);
    } catch (error) {
      console.error('Error al detener conexión SignalR:', error);
    }
  }, []);

  const on = useCallback((eventName: string, callback: (...args: any[]) => void) => {
    signalRService.on(eventName, callback);
  }, []);

  const off = useCallback((eventName: string, callback?: (...args: any[]) => void) => {
    signalRService.off(eventName, callback);
  }, []);

  const invoke = useCallback(async <T = any,>(methodName: string, ...args: any[]): Promise<T> => {
    return signalRService.invoke<T>(methodName, ...args);
  }, []);

  const send = useCallback(async (methodName: string, ...args: any[]): Promise<void> => {
    return signalRService.send(methodName, ...args);
  }, []);

  // Auto-conectar cuando el componente se monta (si está autenticado)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (autoConnect && token) {
      startConnection();
    }
    return () => {
      stopConnection();
    };
  }, [autoConnect, startConnection, stopConnection]);

  // Monitorear cambios en el estado de conexión
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = signalRService.isConnected();
      const state = signalRService.getConnectionState();
      
      if (connected !== isConnected) {
        setIsConnected(connected);
      }
      if (state !== connectionState) {
        setConnectionState(state);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, connectionState]);

  const value: SignalRContextType = {
    isConnected,
    connectionState,
    startConnection,
    stopConnection,
    on,
    off,
    invoke,
    send,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR debe ser usado dentro de un SignalRProvider');
  }
  return context;
};

