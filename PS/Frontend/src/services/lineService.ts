import apiClient from '../config/api';

export interface NewLineDto {
  Name: string;
  Description?: string | null;
}

export interface ApiLine {
  id: string;
  name: string;
  idCompany: string;
  company?: any;
  description?: string | null;
}

export interface UpdateLineDto {
  Id: string;
  Name: string;
  Description?: string | null;
}

class LineService {
  async createLine(dto: NewLineDto): Promise<void> {
    try {
      await apiClient.post('/newline', dto, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo crear el área/rol';
      throw new Error(msg);
    }
  }

  async getAllLines(): Promise<ApiLine[]> {
    try {
      const res = await apiClient.get<ApiLine[]>('/getallline');
      return res.data || [];
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo obtener la lista de áreas/roles';
      throw new Error(msg);
    }
  }

  async addLineToUser(payload: { IdUser: string; IdLine: string }): Promise<void> {
    try {
      await apiClient.post('/addlineuser', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo agregar el usuario al área/rol';
      throw new Error(msg);
    }
  }

  async deleteLineFromUser(payload: { IdUser: string; IdLine: string }): Promise<void> {
    try {
      await apiClient.put('/deletelineuser', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo quitar el usuario del área/rol';
      throw new Error(msg);
    }
  }

  async deleteLine(lineId: string): Promise<void> {
    try {
      await apiClient.put(`/deleteline/${lineId}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo eliminar el área/rol';
      throw new Error(msg);
    }
  }

  async updateLine(payload: UpdateLineDto): Promise<ApiLine> {
    try {
      const res = await apiClient.put<ApiLine>('/updateline', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo actualizar el área/rol';
      throw new Error(msg);
    }
  }
}

export const lineService = new LineService();
