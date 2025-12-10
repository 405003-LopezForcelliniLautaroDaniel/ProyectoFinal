import React from 'react';
import { Box } from '@mui/material';
import LoginForm from '../components/login/LoginForm';
import Footer from '../components/general/Footer';

const Login: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ flexGrow: 1 }}>
        <LoginForm />
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;


