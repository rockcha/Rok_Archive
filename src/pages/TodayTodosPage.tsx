// src/pages/TodayTodosPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // ⬅️ 스피너 아이콘

import AddTodoButton from "@/features/Todo/AddTodoButton";
import TodoList from "@/features/Todo/TodoList";
import type { TodoRow } from "@/features/Todo/types";
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "@/features/Todo/api";
import HomeButton from "@/widgets/Header/HomeButton";
import FloatingMemo from "@/widgets/FloatingMemo";

export default function TodayTodosPage() {
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [loading, setLoading] = useState(false);

  const daily = useMemo(() => todos.filter((t) => t.isDaily), [todos]);
  const normal = useMemo(() => todos.filter((t) => !t.isDaily), [todos]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data);
    } catch (e) {
      toast.error("목록을 불러오지 못했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (content: string, isDaily: boolean) => {
    const created = await addTodo({ content, isDaily });
    setTodos((prev) => [created, ...prev]);
  };

  const handleUpdate = async (
    id: string,
    patch: Partial<Pick<TodoRow, "content" | "isDaily">>
  ) => {
    const updated = await updateTodo(id, patch);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="relative mb-4">
      <h1 className="text-2xl font-bold text-center">오늘의 할일</h1>
      <div className="flex justify-between ">
        <div className="flex">
          <HomeButton />
          <FloatingMemo />
        </div>

        {/* 입력 영역 (로딩 중엔 클릭/입력 방지) */}
        <AddTodoButton onAdd={handleAdd} />
      </div>

      <Card
        className="mt-10 border-neutral-200 min-h-[85dvh] relative" // ⬅️ overlay 포지셔닝
        aria-busy={loading}
      >
        {/* 🔸 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-neutral-900/40 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm">불러오는 중…</span>
          </div>
        )}

        <CardContent
          className={`mt-4 ${loading ? "pointer-events-none select-none" : ""}`}
        >
          {/* 리스트 영역 */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TodoList
              title="Daily Todo"
              items={daily}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
            <TodoList
              title="Todo"
              items={normal}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
