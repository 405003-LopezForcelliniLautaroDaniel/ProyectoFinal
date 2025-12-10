// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from './Components/theme'; // Asegúrate de importar los temas correctamente
import LoginForm from './Pages/Login.jsx';
import Home from './Pages/SubPages/Home.jsx';
import Calendar from './Pages/SubPages/Calendar.jsx';
import signalRService from './Services/signalRService';
import ChatSelect from './Pages/SubPages/Conversation.jsx';
import Chat from './Pages/SubPages/Chats.jsx';
import { LanguageProvider } from './Language/LanguageContext.jsx';

function App() {
  const [clients, setClients] = useState([]);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setTheme] = useState(prefersDarkMode ? lightTheme : darkTheme);

  useEffect(() => {
    signalRService.startConnection();
    signalRService.onReceiveMessage((user) => {
      console.log(`${user}`);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chat" element={<Chat clients={clients} />} />
          <Route path="/chat/telegram/:idClient" element={<ChatSelect clients={clients} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
