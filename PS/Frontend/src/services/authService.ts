import apiClient from '../config/api';
import { LoginRequest, LoginResponse } from '../types/auth';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/login', credentials);
      
      // Verificar si el backend devolvió ok: false
      if (response.data && response.data.ok === false) {
        const errorMsg = response.data.mensajeError || response.data.message || 'Error al iniciar sesión';
        throw new Error(errorMsg);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.message && !error.response) {
        throw error;
      }
      
      if (error.response?.data?.ok === false) {
        const errorMsg = error.response.data.mensajeError || error.response.data.message || 'Error al iniciar sesión';
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lines');
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lines');
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getStoredUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredLines(): any[] {
    const linesStr = localStorage.getItem('lines');
    return linesStr ? JSON.parse(linesStr) : [];
  }

  storeAuthData(token: string, user: any, lines?: any[]): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (lines) {
      localStorage.setItem('lines', JSON.stringify(lines));
    }
  }
}

export const authService = new AuthService();

