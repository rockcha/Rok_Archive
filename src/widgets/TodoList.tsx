// src/features/todos/TodoList.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Minus } from "lucide-react";

type TodoRow = {
  id: string;
  content: string;
};

export default function TodoList() {
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<TodoRow[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // 전체 로드
  const loadAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("todo")
        .select("id, content")
        .order("id", { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as TodoRow[]);
    } catch (e) {
      console.error("loadAll error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAdd = async () => {
    const text = content.trim();
    if (!text) return;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("todo")
        .insert({ content: text }) // 날짜 미사용
        .select("id, content")
        .single();
      if (error) throw error;
      setItems((prev) => [data as TodoRow, ...prev]);
      setContent("");
    } catch (e) {
      console.error("add error:", e);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setItems((p) => p.filter((x) => x.id !== id)); // 낙관적 업데이트
      const { error } = await supabase.from("todo").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("delete error:", e);
      loadAll(); // 실패 시 복구
    }
  };

  // ── 최소화 UI (우상단 작은 버튼)
  if (collapsed) {
    return (
      <div className="fixed top-65 right-3 z-50 ">
        <Button
          size="default"
          variant="default"
          onClick={() => setCollapsed(false)}
          className=" bg-emerald-600  hover:cursor-pointer hover:bg-emerald-500"
        >
          TODO ({items.length}) +
        </Button>
      </div>
    );
  }

  // ── 펼친 UI (카드 우상단에 최소화 버튼)
  return (
    <div className="fixed top-65 right-3 z-50 w-[92vw] max-w-md">
      <Card className="relative border shadow-md">
        {/* 카드 우상단 최소화 버튼 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCollapsed(true)}
          title="최소화"
          className="absolute right-2 top-2 h-8 w-8 hover:cursor-pointer hover:bg-emerald-50"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-lg">Todo List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 추가 입력 영역 */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="할 일 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={!content.trim() || adding}
              className="bg-emerald-600  hover:bg-emerald-500 hover:cursor-pointer"
            >
              추가
            </Button>
          </div>

          {/* 목록 */}
          {loading ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              할 일이 없습니다.
            </div>
          ) : (
            <ul className="list-disc list-outside pl-8 space-y-2 marker:text-zinc-800 dark:marker:text-zinc-500">
              {items.map((t) => (
                // ✅ li에는 flex 주지 않기
                <li key={t.id} className="list-item">
                  {/* ✅ 내부에서만 flex로 정렬 */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{t.content}</span>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        if (checked === true) handleDelete(t.id);
                      }}
                      aria-label="완료하여 삭제"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
