// src/features/tasks/api.ts
import { supabase } from "@/shared/lib/supabase";

import type { Task, TaskType, Schedule } from "./types";

/** DAY: 특정 날짜의 할 일 */
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

/** DUE: 오늘 이후 마감 할 일들 */
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

/** DAILY: 매일 하는 일들 */
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

/** Task 생성 */
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

/** Task 수정 */
export async function updateTask(id: number, patch: Partial<Task>) {
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw error;
}

/** Task 삭제 */
export async function deleteTaskRow(id: number) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

/** 일정(Schedule) - 범위 조회 */
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

/** 일정(Schedule) - 앞으로 N일 */
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

/** ───────────── Daily Memo ───────────── */

type DailyMemoRow = {
  id: number;
  date: string; // "YYYY-MM-DD"
  content: string;
};

/** 특정 날짜 Daily Memo 조회 */
export async function fetchDailyMemo(
  dateYMD: string
): Promise<DailyMemoRow | null> {
  const { data, error } = await supabase
    .from("daily_memo")
    .select("id,date,content")
    .eq("date", dateYMD)
    .maybeSingle();

  if (error) throw error;
  return (data as DailyMemoRow | null) ?? null;
}

/** Daily Memo upsert (date 기준으로 insert/update) */
export async function upsertDailyMemo(payload: {
  date: string;
  content: string;
}): Promise<DailyMemoRow> {
  const { data, error } = await supabase
    .from("daily_memo")
    .upsert(
      {
        date: payload.date,
        content: payload.content,
      },
      { onConflict: "date" } // 🔹 date를 unique로 만들어두면 이 옵션이 동작
    )
    .select("id,date,content")
    .single();

  if (error) throw error;
  return data as DailyMemoRow;
}
