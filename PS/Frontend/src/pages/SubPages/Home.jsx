import React from 'react';
import { Typography, Box } from '@mui/material';
import { useLanguage } from '../../Language/LanguageContext';
import Nav from '../Nav.tsx';

const HomeContent = () => {
  const { translations } = useLanguage();

  console.log('translations:', translations);  // Verifica que translations se esté actualizando

  return (
    <Box style={{ display: 'flex', height: '100vh', marginLeft: '200px' }}>
      <Nav />
      <Typography variant="h4">{translations.home.Title}</Typography> {/* Traducción dinámica */}
    </Box>
  );
};

export default HomeContent;
