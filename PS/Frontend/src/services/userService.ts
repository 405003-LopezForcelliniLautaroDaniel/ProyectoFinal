import apiClient from '../config/api';
import type { ApiLine } from './lineService';

export interface NewUserDto {
  FirstName: string;
  LastName: string;
  UserName: string;
  Password: string;
  Email: string;
}

class UserService {
  async createUser(dto: NewUserDto): Promise<void> {
    await apiClient.post('/newuser', dto, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /getalluser ahora devuelve { available: number, user: ApiUserWithLines[] }
  async getAllUsers(): Promise<GetAllUsersResponse> {
    const res = await apiClient.get<GetAllUsersResponse>('/getalluser');
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/deleteuser/${id}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo eliminar el usuario';
      throw new Error(msg);
    }
  }

  // Actualiza usuario enviando solo el body (sin id en la ruta)
  async updateUser(payload: UpdateUserDto): Promise<ApiUser> {
    try {
      const res = await apiClient.put<ApiUser>(`/updateuser`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo actualizar el usuario';
      throw new Error(msg);
    }
  }
}

export const userService = new UserService();

// Tipado para el GET de usuarios
export interface ApiCompany { id: string; name: string }
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  rol: boolean;
  idCompany: string;
  company?: ApiCompany | null;
  password?: string | null;
}

export interface ApiUserWithLines {
  user: ApiUser;
  lines: ApiLine[];
}

export interface GetAllUsersResponse {
  available: number;
  user: ApiUserWithLines[];
}

// DTO para actualización (PascalCase para backend)
export interface UpdateUserDto {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string | null;
}


