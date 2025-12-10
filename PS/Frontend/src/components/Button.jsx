import React from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function CustomButton({ children, ...props }) {
  const theme = useTheme()
  return (
    <Button
      variant="contained"
      color="success"  // Usa el color definido en el tema (o cambia a primary, secondary, etc. según el tema)
      sx={{
        marginTop: '1vh',     // Aplica el margen superior
        backgroundColor: theme.palette.primary.main, // Sobrescribe el color de fondo del tema si se requiere
        '&:hover': {
          backgroundColor: theme.palette.primary.dark, // Color de fondo en hover
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

function CustomButtonNavbar({ children, ...props }) {
  const theme = useTheme()
  return (
    <Button
      variant="contained"
      color="success"  // Usa el color definido en el tema (o cambia a primary, secondary, etc. según el tema)
      sx={{
        marginTop: '1vh',     // Aplica el margen superior
        backgroundColor: theme.palette.primary.main, // Sobrescribe el color de fondo del tema si se requiere
        '&:hover': {
          backgroundColor: theme.palette.primary.dark, // Color de fondo en hover
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export {CustomButton, CustomButtonNavbar};

