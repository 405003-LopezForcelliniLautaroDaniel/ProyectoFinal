import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      {/* Spacer para compensar AppBar fixed */}
      <Box sx={{ height: (theme) => theme.mixins.toolbar.minHeight }} />
      
      {/* Contenido de la página - forzar altura mínima mayor que viewport para siempre tener scroll */}
      <Box sx={{ minHeight: 'calc(100vh)' }}>
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;

