import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { ChatProvider } from './contexts/ChatContext';
import { SIGNALR_HUB_URL } from './config/api';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import ProtectedRoute from './components/general/ProtectedRoute';
import PublicLayout from './components/general/PublicLayout';
import Gestionar from './pages/Gestionar';
import Chats from './pages/Chats';
import Calendario from './pages/Calendario';
import Dashboard from './pages/Dashboard';
import PreguntasFrecuentes from './pages/PreguntasFrecuentes';
import TerminosCondiciones from './pages/TerminosCondiciones';

// Crear tema personalizado de Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente para manejar la redirección después del login
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/inicio" replace /> : <Login />
        }
      />
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <Inicio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestionar"
        element={
          <ProtectedRoute>
            <Gestionar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <Chats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <Calendario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preguntas-frecuentes"
        element={
          <ProtectedRoute>
            <PreguntasFrecuentes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/terminos-y-condiciones"
        element={
          <PublicLayout>
            <TerminosCondiciones />
          </PublicLayout>
        }
      />
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/inicio" : "/login"} replace />
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SignalRProvider hubUrl={SIGNALR_HUB_URL} autoConnect={true}>
          <Router>
            <ChatProvider>
              <AppRoutes />
            </ChatProvider>
          </Router>
        </SignalRProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

