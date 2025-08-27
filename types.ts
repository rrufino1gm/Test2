export enum TaskStatus {
  Pending = 'Pendente',
  InProgress = 'Em Andamento',
  Completed = 'Concluído',
}

export interface Photo {
  id: string;
  url: string;
  comment: string;
}

export interface Task {
  id: number;
  name: string;
  status: TaskStatus;
  images: Photo[];
  lastUpdated?: string;
}

export interface Phase {
  id: number;
  name: string;
  deliveryDate: string;
  tasks: Task[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}
