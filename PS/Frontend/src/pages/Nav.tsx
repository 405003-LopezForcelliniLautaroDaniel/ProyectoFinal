import React, { useState } from 'react';
import { Box, Button, Grid, Collapse, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../Language/LanguageContext.jsx';
import { blue } from '@mui/material/colors';

function Nav() {
  const { translations } = useLanguage();
  const [selectedSection, setSelectedSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false); // Controla el menú de idiomas
  const [chatsMenuOpen, setChatsMenuOpen] = useState(false); // Controla el submenú de Chats
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta el tamaño de pantalla
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage(); // Obtiene el idioma y la función setLanguage

  const handleSectionChange = (section: string) => {
    try {
      setSelectedSection(section);
      setMenuOpen(false);
      if (section === 'calendar') {
        navigate('/calendar');
      } else if (section === 'chats') {
        setChatsMenuOpen((prev) => !prev); // Cambia la visibilidad del submenú de Chats
      } else if (section === 'home') {
        navigate('/inicio');
      }
    } catch (error) {
    }
  };

  const toggleLanguageMenu = () => {
    setLanguageMenuOpen((prev) => !prev);
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  return (
    <Box display="flex" height="100%">
      <Grid
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: isMobile ? '100%' : '200px',
          backgroundColor: theme.palette.background.default,
          padding: '1rem',
          boxShadow: 5,
          display: menuOpen || !isMobile ? 'flex' : 'none',
          flexDirection: 'column',
          zIndex: 1000,
        }}
      >
        <Button onClick={() => handleSectionChange('home')} fullWidth>
          {translations.Nav.Start}
        </Button>
        <Button onClick={() => handleSectionChange('calendar')} fullWidth>
          {translations.Nav.Calendar}
        </Button>
        <Button onClick={() => handleSectionChange('chats')} fullWidth>
          {translations.Nav.Chats}
        </Button>

        {/* Submenú de Chats con animación */}
        <Collapse in={chatsMenuOpen}>
          <Grid container direction="column"
            sx={{backgroundColor: 'lightgray'}}>
            <Grid 
            item>
              <Button
                onClick={() => {
                  setSelectedSection('home'); // Resetear la sección seleccionada
                  setMenuOpen(false); // Cerrar el menú
                  setChatsMenuOpen(false); // Cerrar el submenú de Chats
                  localStorage.removeItem('client'); // Eliminar el cliente del almacenamiento local
                  navigate('/chat/telegram/0'); // Navegar a la ruta de Telegram
                }}
                variant="outlined"
                fullWidth
              >
                Telegram
              </Button>


            </Grid>
          </Grid>
        </Collapse>

        {/* Botón para mostrar/ocultar opciones de idioma */}
        <Button onClick={toggleLanguageMenu} fullWidth>
          {language === 'es' ? 'Idioma' : 'Language'}
        </Button>

        {/* Opciones de idioma con animación */}
        <Collapse in={languageMenuOpen}>
          <Grid container direction="column" 
            sx={{backgroundColor: 'lightgray'}}>
            <Grid item >
              <Button
                onClick={() => changeLanguage('es')}
                variant={language === 'es' ? 'contained' : 'outlined'} // Destaca el idioma seleccionado
                fullWidth
              >
                Español
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={() => changeLanguage('en')}
                variant={language === 'en' ? 'contained' : 'outlined'} // Destaca el idioma seleccionado
                fullWidth
              >
                English
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Box sx={{ marginLeft: isMobile ? 0 : '200px', flexGrow: 1 }} />
    </Box>
  );
}

export default Nav;
