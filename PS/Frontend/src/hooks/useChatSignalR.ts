import { useEffect } from 'react';
import { useSignalR } from '../contexts/SignalRContext';
import { ChatMessage } from '../services/chatService';

export interface ChatTransferredData {
  chatId: string;
  newUserId: string;
  userName: string;
  clientName: string;
}

export interface ChatStatusChangedData {
  idChat: string;
  status: string;
  clientName: string;
  idUser?: string;
}

interface UseChatSignalRProps {
  onNewMessage?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onChatStatusChanged?: (data: ChatStatusChangedData) => void;
  onChatTransferred?: (data: ChatTransferredData) => void;
  onChatArchived?: (chatId: string) => void;
  onNewChat?: (data: {
    idChat: string;
    idClient: string;
    idCompany?: string;
    clientName: string;
    status: string;
    contact: string;
    createdAt?: string;
    idLine?: string;
  }) => void;
}

export const useChatSignalR = ({
  onNewMessage,
  onMessageReceived,
  onChatStatusChanged,
  onChatTransferred,
  onChatArchived,
  onNewChat,
}: UseChatSignalRProps) => {
  const { on, off, isConnected } = useSignalR();

  useEffect(() => {
    if (!isConnected) return;

    // Registrar listeners
    if (onNewMessage) on('ReceiveMessage', onNewMessage);
    if (onMessageReceived) on('MessageReceived', onMessageReceived);
    if (onChatStatusChanged) on('ChatStatusChanged', onChatStatusChanged);
    if (onChatTransferred) on('ChatTransferred', onChatTransferred);
    if (onChatArchived) on('ChatArchived', onChatArchived);
    if (onNewChat) on('NewChat', onNewChat);

    // Cleanup
    return () => {
      if (onNewMessage) off('ReceiveMessage', onNewMessage);
      if (onMessageReceived) off('MessageReceived', onMessageReceived);
      if (onChatStatusChanged) off('ChatStatusChanged', onChatStatusChanged);
      if (onChatTransferred) off('ChatTransferred', onChatTransferred);
      if (onChatArchived) off('ChatArchived', onChatArchived);
      if (onNewChat) off('NewChat', onNewChat);
    };
  }, [isConnected, on, off, onNewMessage, onMessageReceived, onChatStatusChanged, onChatTransferred, onChatArchived, onNewChat]);

  return { isConnected };
};

