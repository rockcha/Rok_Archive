// src/features/todos/api.ts
"use client";

import { supabase } from "@/shared/lib/supabase";
import type { TodoRow } from "./types";

const TABLE = "todo"; // public.todo

export async function fetchTodos(): Promise<TodoRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, content, isDaily")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TodoRow[];
}

export async function addTodo(input: Pick<TodoRow, "content" | "isDaily">) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ content: input.content, isDaily: input.isDaily })
    .select("id, content, isDaily")
    .single();

  if (error) throw error;
  return data as TodoRow;
}

export async function updateTodo(
  id: string,
  patch: Partial<Pick<TodoRow, "content" | "isDaily">>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("id, content, isDaily")
    .single();

  if (error) throw error;
  return data as TodoRow;
}

export async function deleteTodo(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
