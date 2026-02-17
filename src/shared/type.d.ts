export interface Bdata {
  date: string;
  title: string;
  targetLog: number;
  log: LogData[];
  bLevel: number;
}

export type StorageData = {
  today: Bdata | null;
  history?: Array<Bdata> | [];
}

export type LogData = {
  content: string;
  createdAt: string;
}