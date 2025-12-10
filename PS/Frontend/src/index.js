// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LanguageProvider } from './Language/LanguageContext.jsx'; // Importa el LanguageProvider
import { lightTheme, darkTheme } from './components/theme'; // Importa los temas

ReactDOM.render(
  <LanguageProvider> {/* Envolver la aplicación con LanguageProvider */}
    <ThemeProvider theme={darkTheme}> {/* Usa lightTheme por defecto o darkTheme según el sistema */}
      <React.StrictMode>
        <CssBaseline />
        <App />
      </React.StrictMode>
    </ThemeProvider>
  </LanguageProvider>,
  document.getElementById('root')
);
