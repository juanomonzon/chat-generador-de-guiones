export interface Evento {
  titulo: string;
  lugar: string;
  tipo_evento: string;
  fecha_evento: string;
  hora: string;
  precio: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface SavedScript {
  id: string;
  timestamp: number;
  dateFormatted: string;
  prompt: string;
  title: string;
  content: string;
  copy: string;
  timelineData: TimelineData | null;
}

export interface TimelineSegment {
  start: number;
  end: number;
  label?: string;
  content?: string;
}

export interface TimelineLayer {
  type: 'video' | 'text' | 'audio' | string;
  segments: TimelineSegment[];
}

export interface TimelineData {
  duration: number;
  layers: TimelineLayer[];
}
