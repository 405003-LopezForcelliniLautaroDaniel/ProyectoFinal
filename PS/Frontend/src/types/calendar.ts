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

// Tipo para eventos en el calendario visual
export interface CalendarViewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: CalendarEvent;
}

