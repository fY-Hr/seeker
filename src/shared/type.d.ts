export interface Bdata {
  id: number;
  date: string;
  title: string;
  targetLog: number;
  log: LogData[];
  bLevel: number;
}

interface subTask {
  id: string;
  title: string;
  mark: "todo" | "completed" | "none";
  createdAt: string;
  modifiedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  urgency: "none" | "low" | "medium" | "high" 
  subTasks: subTask[];
  createdAt: string;
  modifiedAt: string;
}

export interface SettingsData {
  mode: 'trackup' | 'buildup' | null;
  showViewHints: boolean;
}

export type StorageData = {
  trackup: {
    tasks?: Task[]
    currentTaskId?: string | null
  }
  buildup: {
    today: Bdata | null;
    history?: Array<Bdata> | [];
  }
}

export type LogData = {
  content: string;
  createdAt: string;
}
