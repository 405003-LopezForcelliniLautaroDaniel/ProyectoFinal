import React, { useEffect, useState } from 'react';
import { Box, ButtonGroup, Button, Divider, List, ListItemButton, ListItemText, Typography, CircularProgress } from '@mui/material';
import { chatService } from '../../services/chatService';
import { extractApiErrorMessage } from '../../utils/apiError';
import { ErrorFeedback } from '../general/Feedback';
import { useChat } from '../../contexts/ChatContext';

type TabKey = 'entrante' | 'tomado' | 'archivado';

const ChatList: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('entrante');
  const [loading, setLoading] = useState(true);
  const [errorOpen, setErrorOpen] = useState<string | null>(null);
  const { selectChat, selectedChat, allChats, setAllChats } = useChat();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await chatService.getAllChats();
        if (!mounted) return;
        setAllChats(data);
      } catch (err: any) {
        if (!mounted) return;
        setErrorOpen(extractApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [setAllChats]);

  // Mapear status del backend a nuestras tabs
  const statusMap: Record<string, TabKey> = {
    'pending': 'entrante',
    'taken': 'tomado',
    'archived': 'archivado',
  };

  // Filtrar chats según tab
  const filtered = allChats.filter(c => statusMap[c.status] === tab);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      minHeight: 0,
      maxHeight: 'calc(100vh - 120px)'
    }}>
      <Box sx={{ mb: 1, flexShrink: 0 }}>
        <ButtonGroup fullWidth>
          <Button variant={tab === 'entrante' ? 'contained' : 'outlined'} onClick={() => setTab('entrante')}>Entrante</Button>
          <Button variant={tab === 'tomado' ? 'contained' : 'outlined'} onClick={() => setTab('tomado')}>Tomado</Button>
          <Button variant={tab === 'archivado' ? 'contained' : 'outlined'} onClick={() => setTab('archivado')}>Archivado</Button>
        </ButtonGroup>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        mt: 1,
        minHeight: 0
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">Sin chats</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filtered.map((c, idx) => (
              <ListItemButton 
                key={c.id || `${c.nameClient}-${idx}`}
                selected={selectedChat?.id === c.id}
                onClick={() => selectChat(c.id, c.nameClient, c.contact)}
                sx={{ 
                  bgcolor: selectedChat?.id === c.id ? 'primary.light' : 'action.hover',
                  mb: 0.5,
                  borderRadius: 1,
                  mx: 1,
                  '&:hover': {
                    bgcolor: selectedChat?.id === c.id ? 'primary.light' : 'action.selected',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }
                }}
              >
                <ListItemText 
                  primary={c.nameClient}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: selectedChat?.id === c.id ? 600 : 400
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
      <ErrorFeedback 
        open={!!errorOpen} 
        message={errorOpen || ''} 
        onClose={() => setErrorOpen(null)} 
      />
    </Box>
  );
};

export default ChatList;



