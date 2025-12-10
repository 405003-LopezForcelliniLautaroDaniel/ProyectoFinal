import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1976d2',
        color: 'white',
        py: 2,
        mt: 'auto',
        position: 'relative',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2">
            © {currentYear} Todos los derechos reservados
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              component={RouterLink}
              to="/preguntas-frecuentes"
              sx={{
                color: 'white',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                  opacity: 0.8,
                },
              }}
            >
              <Typography variant="body2">
                Preguntas Frecuentes
              </Typography>
            </Link>
            <Link
              component={RouterLink}
              to="/terminos-y-condiciones"
              sx={{
                color: 'white',
                textDecoration: 'underline',
                '&:hover': {
                  textDecoration: 'none',
                  opacity: 0.8,
                },
              }}
            >
              <Typography variant="body2">
                Términos y Condiciones
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

