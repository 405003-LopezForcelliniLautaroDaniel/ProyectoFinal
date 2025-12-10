import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import AttachmentButton from './AttachmentButton';
import { useChat } from '../../contexts/ChatContext';
import { chatService } from '../../services/chatService';

const ChatInput: React.FC = () => {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { selectedChat, updateChatInList } = useChat();

  if (!selectedChat || selectedChat.status === 'archived') {
    return null;
  }

  const send = async () => {
    if (!value.trim() || !selectedChat || isSending || selectedChat.status === 'archived') return;
    
    const messageToSend = value;
    const chatId = selectedChat.id;
    const chatStatus = selectedChat.status;
    
    setValue('');
    setIsSending(true);
    
    try {
      await chatService.sendMessage({
        message: messageToSend,
        idChat: chatId,
        type: '1',
      });
      
      if (chatStatus === 'pending') {
        updateChatInList(chatId, 'taken');
      }
      
    } catch (error) {
      alert('Error al enviar el mensaje');
      setValue(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
      <AttachmentButton onFilesSelected={(files) => { 
        if (!selectedChat || selectedChat.status === 'archived') return;
        const chatId = selectedChat.id;
        const chatStatus = selectedChat.status;

        Array.from(files).forEach(async (file) => {
          try {
            let idMessageType = 3;
            if (file.type.startsWith('image/')) idMessageType = 2;
            else if (file.type.startsWith('audio/')) idMessageType = 4;

            await chatService.sendAttachment(chatId, file, idMessageType);

            if (chatStatus === 'pending') {
              updateChatInList(chatId, 'taken');
            }
          } catch (err) {
            alert((err as Error)?.message || 'No se pudo enviar el archivo');
          }
        });
      }} />
      <TextField
        fullWidth
        placeholder="Escribe un mensaje..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isSending) { e.preventDefault(); send(); } }}
        multiline
        maxRows={4}
        disabled={!selectedChat || isSending}
      />
      <Button 
        variant="contained" 
        onClick={send}
        disabled={!selectedChat || !value.trim() || isSending}
      >
        {isSending ? 'Enviando...' : 'Enviar'}
      </Button>
    </Box>
  );
};

export default ChatInput;
