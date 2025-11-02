// src/features/tasks/types.ts
export type TaskType = "DAY" | "DUE" | "DAILY";

export type Task = {
  id: number;
  title: string;
  type: TaskType;
  memo: string | null;
  links: string[];
  is_completed: boolean;
  sort_order: number | null;
  date: string; // 'YYYY-MM-DD'
  created_at: string;
  updated_at: string;
};

export type Schedule = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  content: string;
};
