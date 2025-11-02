// src/features/tasks/api.ts
import { supabase } from "@/shared/lib/supabase";

import type { Task, TaskType, Schedule } from "./types";

export async function fetchDayTasksByDate(ymd: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("type", "DAY")
    .eq("date", ymd)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Task[];
}

export async function fetchDueTasksFrom(todayYMD: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("type", "DUE")
    .gte("date", todayYMD)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Task[];
}

export async function fetchDailyTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("type", "DAILY")
    .order("sort_order", { ascending: true, nullsFirst: true })
    .order("id", { ascending: true }); // 보조 정렬
  if (error) throw error;
  return data as Task[];
}

export async function createTask(payload: {
  title: string;
  type: TaskType;
  date: string;
  memo: string | null;
  links: string[];
}) {
  const { error } = await supabase.from("tasks").insert({
    ...payload,
    is_completed: false,
    sort_order: null,
  });
  if (error) throw error;
}

export async function updateTask(id: number, patch: Partial<Task>) {
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTaskRow(id: number) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

/** 일정(Schedule) */
export async function fetchSchedulesInRange(startStr: string, endStr: string) {
  const { data, error } = await supabase
    .from("schedule")
    .select("id,date,title,content")
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Schedule[];
}

export async function fetchUpcomingSchedules(limitDays = 30) {
  const today = new Date();
  const startStr = today.toLocaleDateString("sv-SE");
  const end = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + limitDays
  );
  const endStr = end.toLocaleDateString("sv-SE");
  return fetchSchedulesInRange(startStr, endStr);
}
/** 월 범위 DAY 조회 */
export async function fetchDayTasksInRange(
  startYMD: string,
  endYMD: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("type", "DAY")
    .gte("date", startYMD)
    .lte("date", endYMD)
    .order("date", { ascending: true });
  if (error || !data) return [];
  return data as Task[];
}

/** 월 범위 DUE 조회 */
export async function fetchDueTasksInRange(
  startYMD: string,
  endYMD: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("type", "DUE")
    .gte("date", startYMD)
    .lte("date", endYMD)
    .order("date", { ascending: true });
  if (error || !data) return [];
  return data as Task[];
}
