import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { chatService, ChatDetail, ChatMessage, ApiChat } from '../services/chatService';
import { extractApiErrorMessage } from '../utils/apiError';
import { useChatSignalR } from '../hooks/useChatSignalR';
import { usePageVisibility } from '../hooks/usePageVisibility';
import MessageNotification from '../components/general/MessageNotification';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationState {
  open: boolean;
  clientName: string;
  message: string;
}

interface ChatContextType {
  selectedChat: ChatDetail | null;
  isLoadingChat: boolean;
  errorChat: string | null;
  allChats: ApiChat[];
  setAllChats: (chats: ApiChat[]) => void;
  selectChat: (chatId: string, chatName?: string, chatPhone?: string) => Promise<void>;
  clearSelectedChat: () => void;
  addMessage: (message: ChatMessage) => void;
  updateChatStatus: (status: string) => void;
  updateChatInList: (chatId: string, status: string) => void;
  removeChatFromList: (chatId: string) => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState<ChatDetail | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [errorChat, setErrorChat] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<ApiChat[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    clientName: '',
    message: '',
  });
  
  const { isUserPresent } = usePageVisibility('/chats');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAllChats([]);
      return;
    }

    let mounted = true;
    const loadChats = async () => {
      try {
        const data = await chatService.getAllChats();
        if (!mounted) return;
        setAllChats(data);
      } catch (err: any) {
        if (!mounted) return;
      }
    };
    loadChats();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    const chat = allChats.find(c => c.id === message.idChat);
    const clientName = chat?.nameClient || message.clientName || 'Cliente';
    
    if (!isUserPresent) {
      let notificationMessage = message.content;
      if (message.idMessageType === 2) {
        notificationMessage = '📷 Imagen';
      } else if (message.idMessageType === 3) {
        notificationMessage = '📎 Archivo';
      } else if (message.idMessageType === 4) {
        notificationMessage = '🔊 Audio';
      }
      
      notificationService.showNotification(`💬 ${clientName}`, {
        body: notificationMessage,
      });
      
      setNotification({
        open: true,
        clientName: clientName,
        message: notificationMessage,
      });
    }
    
    setSelectedChat(prevChat => {
      if (!prevChat) {
        return null;
      }
      
      if (message.idChat === prevChat.id) {
        return {
          ...prevChat,
          messages: [...prevChat.messages, message],
        };
      } else {
        return prevChat;
      }
    });
  }, [allChats, isUserPresent]);
  
  const handleCloseNotification = () => {
    setNotification({ open: false, clientName: '', message: '' });
  };

  const handleChatStatusChanged = useCallback((data: { 
    idChat: string; 
    status: string; 
    clientName: string; 
    idUser?: string 
  }) => {
    const currentUserId = user?.id;
    
    if (data.status === 'taken' && data.idUser && data.idUser !== currentUserId) {
      setAllChats(prevChats => prevChats.filter(chat => chat.id !== data.idChat));
      
      setSelectedChat(prevChat => {
        if (prevChat?.id === data.idChat) {
          return null;
        }
        return prevChat;
      });
      return;
    }
    
    if (data.status === 'archived') {
      setAllChats(prevChats => prevChats.filter(chat => chat.id !== data.idChat));
      
      setSelectedChat(prevChat => {
        if (prevChat?.id === data.idChat) {
          return null;
        }
        return prevChat;
      });
      return;
    }
    
    setAllChats(prevChats => 
      prevChats.map(chat => 
        chat.id === data.idChat ? { ...chat, status: data.status } : chat
      )
    );
    
    setSelectedChat(prevChat => {
      if (prevChat?.id === data.idChat) {
        return { ...prevChat, status: data.status };
      }
      return prevChat;
    });
  }, [user]);

  const handleChatTransferred = useCallback((data: { chatId: string; newUserId: string; userName: string; clientName: string }) => {
    const transferredChat: ApiChat = {
      id: data.chatId,
      nameClient: data.clientName,
      contact: '',
      status: 'taken',
    };
    
    setAllChats(prevChats => {
      const exists = prevChats.some(c => c.id === data.chatId);
      if (exists) {
        return prevChats;
      }
      
      return [...prevChats, transferredChat];
    });
    
    if (!isUserPresent) {
      notificationService.showNotification('🔄 Chat transferido', {
        body: `De ${data.userName}: ${data.clientName}`,
      });
      
      setNotification({
        open: true,
        clientName: `Chat transferido de ${data.userName}`,
        message: `Nuevo chat: ${data.clientName}`,
      });
    }
  }, [isUserPresent]);

  const handleNewChat = useCallback((data: {
    idChat: string;
    idClient: string;
    idCompany?: string;
    clientName: string;
    status: string;
    contact: string;
    createdAt?: string;
    idLine?: string;
  }) => {
    const newApiChat: ApiChat = {
      id: data.idChat,
      nameClient: data.clientName,
      contact: data.contact || '',
      status: data.status || 'pending',
    };

    setAllChats(prev => {
      const exists = prev.some(c => c.id === data.idChat);
      if (exists) {
        return prev;
      }
      return [...prev, newApiChat];
    });

    if (!isUserPresent) {
      notificationService.showNotification('🆕 Nuevo chat', {
        body: `${data.clientName} - ${data.contact}`,
      });
      
      setNotification({
        open: true,
        clientName: data.clientName,
        message: 'Nuevo chat entrante',
      });
    }
  }, [isUserPresent]);
  useChatSignalR({
    onNewMessage: handleNewMessage,
    onChatStatusChanged: handleChatStatusChanged,
    onChatTransferred: handleChatTransferred,
    onNewChat: handleNewChat,
  });

  const selectChat = async (chatId: string, chatName?: string, chatPhone?: string): Promise<void> => {
    setIsLoadingChat(true);
    setErrorChat(null);
    try {
      const messages = await chatService.getChatById(chatId);
      const chatFromList = allChats.find(c => c.id === chatId);
      const resolvedStatus = chatFromList?.status || 'pending';
      const detail: ChatDetail = {
        id: chatId,
        nameClient: chatName || 'Chat',
        phoneClient: chatPhone,
        status: resolvedStatus,
        messages: messages,
      };
      setSelectedChat(detail);
    } catch (err: any) {
      setErrorChat(extractApiErrorMessage(err));
      setSelectedChat(null);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const clearSelectedChat = () => {
    setSelectedChat(null);
    setErrorChat(null);
  };

  const addMessage = (message: ChatMessage) => {
    setSelectedChat(prevChat => {
      if (!prevChat) {
        return null;
      }
      
      return {
        ...prevChat,
        messages: [...prevChat.messages, message],
      };
    });
  };

  const updateChatStatus = (status: string) => {
    setSelectedChat(prevChat => {
      if (!prevChat) return null;
      
      return {
        ...prevChat,
        status: status,
      };
    });
  };

  const updateChatInList = (chatId: string, status: string) => {
    setAllChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, status } : chat
      )
    );
    if (selectedChat?.id === chatId) {
      updateChatStatus(status);
    }
  };

  const removeChatFromList = (chatId: string) => {
    setAllChats(prevChats => 
      prevChats.filter(chat => chat.id !== chatId)
    );
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };


  const clearError = () => setErrorChat(null);

  const value: ChatContextType = {
    selectedChat,
    isLoadingChat,
    errorChat,
    allChats,
    setAllChats,
    selectChat,
    clearSelectedChat,
    addMessage,
    updateChatStatus,
    updateChatInList,
    removeChatFromList,
    clearError,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      <MessageNotification
        open={notification.open}
        clientName={notification.clientName}
        message={notification.message}
        onClose={handleCloseNotification}
      />
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider');
  }
  return context;
};
