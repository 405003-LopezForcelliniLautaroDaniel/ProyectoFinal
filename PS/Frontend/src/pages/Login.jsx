import React, { useState } from 'react';
import {apiRoutes} from '../apiRoutes.ts';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from '@mui/material';
import { CustomButton } from '../Components/Button.jsx';
import { useTheme } from '@mui/material/styles';

export const getToken = () => localStorage.getItem('token');
export const getUserId = () => localStorage.getItem('userId');

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiRoutes.login.url, {
        method: apiRoutes.login.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        console.log('Inicio de sesión exitoso');
        navigate('/inicio');
      } else {
        console.error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor:theme.palette.background.paper
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          boxShadow: 5,
          padding: 3,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor:theme.palette.background.default
        }}
      >
        <div style={{ backgroundColor: '', padding: '30px' }}>
          <form onSubmit={handleSubmit}>
            <h3>Login</h3>
            <input
              type="text"
              placeholder="Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /><br/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            /><br/>
    <CustomButton type="submit">
      Aceptar
    </CustomButton>
          </form>
        </div>
      </Container>
    </div>
  );
  
}