import apiClient from '../config/api';

export interface ApiChat {
  id: string;
  nameClient: string;
  contact: string;
  status: string; // 'pending', 'taken', 'archived', etc.
}

export interface ChatMessage {
  id?: string; // Opcional porque SignalR no siempre lo envía
  idChat: string;
  idClient: string | null;
  idUser: string | null;
  idMessageType: number;
  content: string;
  time: string;
  clientName?: string; // Nombre del cliente (solo viene de SignalR)
}

export interface ChatDetail {
  id: string;
  nameClient: string;
  phoneClient?: string;
  status: string;
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  message: string;
  idChat: string;
  type: string; // "1" texto, "2" imagen, "3" archivo, "4" audio
}

export interface DashboardChatResult {
  day?: string[];
  Day?: string[];
  total?: number[];
  Total?: number[];
}

export interface DashboardChatForLineResult {
  Line?: string[];
  line?: string[];
  Total?: number[];
  total?: number[];
}

export interface DashboardChatForUserResult {
  User?: string[];
  user?: string[];
  Total?: number[];
  total?: number[];
}

export interface DashboardChatTakenResult {
  User?: string[];
  user?: string[];
  Total?: number[];
  total?: number[];
}

export interface DashboardChatNewResult {
  Day?: string[];
  day?: string[];
  Total?: number[];
  total?: number[];
}

export interface DashboardChatOpenPercentageResult {
  Percentage?: number;
  percentage?: number;
}

class ChatService {
  async getAllChats(): Promise<ApiChat[]> {
    try {
      const res = await apiClient.get<ApiChat[]>('/allchat');
      return res.data || [];
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo obtener la lista de chats';
      throw new Error(msg);
    }
  }

  async getChatById(chatId: string): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/chat/${chatId}`);
      return res.data || [];
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo obtener el detalle del chat';
      throw new Error(msg);
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    try {
      const formData = new FormData();
      formData.append('Message', request.message);
      const typeMap: Record<string, string> = {
        '1': 'Texto',
        '2': 'Imagen',
        '3': 'Archivo',
        '4': 'Audio',
        'Texto': 'Texto',
        'Imagen': 'Imagen',
        'Archivo': 'Archivo',
        'Audio': 'Audio',
      };
      formData.append('Type', typeMap[request.type] ?? 'Texto');
      formData.append('IdChat', request.idChat);

      const res = await apiClient.post<ChatMessage>('/message', formData, {
        timeout: 60000
      });
      
      return res.data;
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        throw new Error('La petición tardó demasiado. Intenta nuevamente.');
      } else if (e.response?.status) {
        const msg = e.response.data?.message || `Error del servidor: ${e.response.status}`;
        throw new Error(msg);
      } else {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
    }
  }

  async sendAttachment(idChat: string, file: File, idMessageType: number): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('IdChat', idChat);
      const typeName = idMessageType === 2 ? 'Imagen' : idMessageType === 4 ? 'Audio' : 'Archivo';
      formData.append('Type', typeName);
      formData.append('Message', file.name);
      formData.append('File', file, file.name);

      await apiClient.post('/message', formData, {
        headers: {},
        timeout: 120000,
      });
    } catch (e: any) {
      if (e.code === 'ECONNABORTED') {
        throw new Error('La carga tardó demasiado. Intenta nuevamente.');
      } else if (e.response?.status) {
        const msg = e.response.data?.message || `Error del servidor: ${e.response.status}`;
        throw new Error(msg);
      } else {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
    }
  }

  async archiveChat(idChat: string): Promise<void> {
    try {
      await apiClient.put(`/archived/${idChat}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo archivar el chat';
      throw new Error(msg);
    }
  }

  async transferChat(idChat: string, idUser: string): Promise<void> {
    try {
      await apiClient.put('/transfer', {
        IdChat: idChat,
        IdUser: idUser
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo transferir el chat';
      throw new Error(msg);
    }
  }

  async getDashboardChatStats(): Promise<DashboardChatResult> {
    try {
      const res = await apiClient.get<DashboardChatResult>('/dashboardchat');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas del dashboard';
      throw new Error(msg);
    }
  }

  async getDashboardChatForLine(): Promise<DashboardChatForLineResult> {
    try {
      const res = await apiClient.get<DashboardChatForLineResult>('/dashboardchatforline');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas de chats por línea';
      throw new Error(msg);
    }
  }

  async getDashboardChatForUser(): Promise<DashboardChatForUserResult> {
    try {
      const res = await apiClient.get<DashboardChatForUserResult>('/chatforuser');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas de chats por usuario';
      throw new Error(msg);
    }
  }

  async getDashboardChatTaken(): Promise<DashboardChatTakenResult> {
    try {
      const res = await apiClient.get<DashboardChatTakenResult>('/dashboardchattaken');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas de chats abiertos por usuario';
      throw new Error(msg);
    }
  }

  async getDashboardChatNew(): Promise<DashboardChatNewResult> {
    try {
      const res = await apiClient.get<DashboardChatNewResult>('/dashboardchatnew');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas de chats nuevos';
      throw new Error(msg);
    }
  }

  async getDashboardChatOpenPercentage(): Promise<DashboardChatOpenPercentageResult> {
    try {
      const res = await apiClient.get<DashboardChatOpenPercentageResult>('/dashboardchatopenpercentage');
      return res.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo obtener el porcentaje de chats abiertos';
      throw new Error(msg);
    }
  }
}

export const chatService = new ChatService();
