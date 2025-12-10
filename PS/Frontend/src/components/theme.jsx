// src/Components/theme.jsx
import { createTheme } from '@mui/material/styles';

const lightColors = {
  primary: "#1565C0", // Azul Intenso
  secondary: "#E3F2FD", // Azul Suave
  backgroundMain: "#FFFFFF", // Blanco
  backgroundSecondary: "#F5F5F5", // Gris Claro
  backgroundTertiary: "#E3F2FD", // Azul Suave
  textPrimary: "#212121", // Negro Suave
  textSecondary: "#616161", // Gris Oscuro
  buttonMain: "#1565C0", // Azul Intenso
  buttonSecondary: "#E3F2FD", // Azul Suave
  warning: "#FFCDD2", // Rosa Suave
  contrastText: '#ffffff',
};

const darkColors = {
  primary: "#FFEB3B", // Amarillo Brillante
  secondary: "#FF9800", // Naranja
  backgroundMain: "#121212", // Negro Predominante
  backgroundSecondary: "#1E1E1E", // Gris Oscuro
  backgroundTertiary: "#424242", // Gris Medio
  textPrimary: "#FFFFFF", // Blanco Puro
  textSecondary: "#B0B0B0", // Gris Claro
  buttonMain: "#FFEB3B", // Amarillo Brillante
  buttonSecondary: "#FF9800", // Naranja
  warning: "#E57373", // Rojo Suave
  contrastText: '#ffffff',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: lightColors.primary,
    },
    secondary: {
      main: lightColors.secondary,
    },
    background: {
      default: lightColors.backgroundMain,
      paper: lightColors.backgroundSecondary,
    },
    text: {
      primary: lightColors.textPrimary,
      secondary: lightColors.textSecondary,
    },
    button: {
      main: lightColors.buttonMain,
      secondary: lightColors.buttonSecondary,
    },
    warning: {
      main: lightColors.warning,
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: darkColors.primary,
    },
    secondary: {
      main: darkColors.secondary,
    },
    background: {
      default: darkColors.backgroundMain,
      paper: darkColors.backgroundSecondary,
    },
    text: {
      primary: darkColors.textPrimary,
      secondary: darkColors.textSecondary,
    },
    button: {
      main: darkColors.buttonMain,
      secondary: darkColors.buttonSecondary,
    },
    warning: {
      main: darkColors.warning,
    },
  },
});



// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#2c86e0',  // Celeste principal
//       light: '#80cfff', // Celeste claro
//       dark: '#0059cc',  // Celeste oscuro
//       contrastText: '#ffffff', // Texto claro sobre celeste
//     },
//     secondary: {
//       main: '#808080', // Gris principal
//       light: '#b3b3b3', // Gris claro
//       dark: '#4d4d4d', // Gris oscuro
//       contrastText: '#ffffff', // Texto claro sobre gris
//     },
//     background: {
//       default: '#bdbdbd', // Fondo gris claro
//       paper: '#757575',   // Fondo de tarjetas y modales en blanco
//     },
//     text: {
//       primary: '#333333', // Texto en gris oscuro
//       secondary: '#666666', // Texto en gris intermedio
//     },
//   },
// });

// export default theme;

