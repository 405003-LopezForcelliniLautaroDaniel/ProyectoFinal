import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface CalendarEvent {
  id: string;
  description: string;
  time: string; // ISO 8601 format
  idCompany: string;
  idClient?: string;
  client?: {
    id: string;
    name: string;
    contact: string;
  };
}

export interface NewEventRequest {
  description: string;
  time: string; // ISO 8601 format
  idClient?: string;
}

export interface EditEventRequest {
  description?: string;
  time?: string; // ISO 8601 format
}

export interface DashboardNoteResult {
  Note?: number;
  note?: number;
  NoteForClient?: number;
  noteForClient?: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

class CalendarService {
  async getAllEvents(): Promise<CalendarEvent[]> {
    const response = await axios.get<CalendarEvent[]>(
      `${API_BASE_URL}/getCalendar`,
      getAuthHeaders()
    );
    return response.data;
  }

  async createEvent(event: NewEventRequest): Promise<CalendarEvent> {
    const response = await axios.post<CalendarEvent>(
      `${API_BASE_URL}/newCalendar`,
      {
        Description: event.description,
        Time: event.time,
        IdClient: event.idClient
      },
      getAuthHeaders()
    );
    return response.data;
  }

  async updateEvent(id: string, event: EditEventRequest): Promise<CalendarEvent> {
    const response = await axios.patch<CalendarEvent>(
      `${API_BASE_URL}/editCalendar/${id}`,
      {
        Description: event.description,
        Time: event.time
      },
      getAuthHeaders()
    );
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/deleteCalendar/${id}`,
      getAuthHeaders()
    );
  }

  async getEventsByClient(idClient: string): Promise<CalendarEvent[]> {
    const response = await axios.get<CalendarEvent[]>(
      `${API_BASE_URL}/getByIdClient/${idClient}`,
      getAuthHeaders()
    );
    return response.data;
  }

  async getDashboardNotes(): Promise<DashboardNoteResult> {
    try {
      const response = await axios.get<DashboardNoteResult>(
        `${API_BASE_URL}/dashboardnotes`,
        getAuthHeaders()
      );
      
      return response.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudieron obtener las estadísticas de notas';
      throw new Error(msg);
    }
  }
}

export const calendarService = new CalendarService();
export default calendarService;

