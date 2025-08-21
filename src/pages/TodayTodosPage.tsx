// src/pages/TodayTodosPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { toast } from "sonner";

import HomeButton from "@/widgets/Header/HomeButton";
import TodoForm from "@/features/Todo/TodoForm";
import TodoList from "@/features/Todo/TodoList";
import type { TodoRow } from "@/features/Todo/types";
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} from "@/features/Todo/api";

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
    <div className="relative mx-auto w-full max-w-screen-lg bg-neutral-100 px-6 py-6 min-h-[100dvh] pb-[env(safe-area-inset-bottom)] ">
      {/* ── 헤더: 제목 가운데 + 홈버튼 오른쪽(오버레이, 높이 영향 X) ── */}
      <div className="relative mb-4">
        <h1 className="text-2xl font-bold text-center">오늘의 할일</h1>

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2">
            {/* 시각 균형을 위해 살짝 축소 */}
            <div className="origin-right scale-75 sm:scale-90">
              <HomeButton />
            </div>
          </div>
        </div>
      </div>

      {/* ── 본문 카드 ── */}
      <Card className="mt-10 border-neutral-200 min-h-[85dvh]">
        <CardContent className="mt-4">
          {/* 입력 영역 */}
          <TodoForm onAdd={handleAdd} className="mb-4" />

          {/* 리스트 영역: 두 컬럼 */}
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
