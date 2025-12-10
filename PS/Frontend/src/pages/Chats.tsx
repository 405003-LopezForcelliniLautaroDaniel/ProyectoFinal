import React from 'react';
import { Box, Grid, Paper } from '@mui/material';
import ChatHeader from '../components/chats/ChatHeader';
import ChatMessages from '../components/chats/ChatMessages';
import ChatInput from '../components/chats/ChatInput';
import ChatList from '../components/chats/ChatList';
import NotificationPrompt from '../components/general/NotificationPrompt';

const Chats: React.FC = () => {
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NotificationPrompt />

      <Grid container sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Paper sx={{ 
            m: { xs: 1, md: 2 }, 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <ChatHeader />
            <Box sx={{ 
              flexGrow: 1, 
              minHeight: 0, 
              overflowY: 'auto', 
              overflowX: 'hidden',
              mt: 1,
              maxHeight: 'calc(90vh - 200px)'
            }}>
              <ChatMessages />
            </Box>
            <Box sx={{ mt: 1, flexShrink: 0 }}>
              <ChatInput />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Paper sx={{ 
            m: { xs: 1, md: 2 }, 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <ChatList />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chats;



