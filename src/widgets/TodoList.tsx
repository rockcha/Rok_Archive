// src/features/todos/TodoList.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";

type TodoRow = {
  id: string;
  content: string;
};

export default function TodoList() {
  const [collapsed, setCollapsed] = useState(true);
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
        .insert({ content: text })
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

  /* -------------------- 최소화 UI (우상단 작은 버튼) -------------------- */
  if (collapsed) {
    return (
      <Card className="fixed top-30 right-3 z-50 w-[82vw] max-w-md">
        <CardHeader className="flex flex-row items-center justify-between ">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📝</span> 오늘의 할일 목록
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              현재 할 일 <span className="font-medium">{items.length}</span>
              개가 있어요
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(false)}
            title="펼치기"
          >
            펼치기
          </Button>
        </CardHeader>

        {/* 접힘 상태에선 본문은 비움 (원하면 간단 가이드 한 줄 넣어도 됨) */}
      </Card>
    );
  }

  /* -------------------- 펼친 UI (SchedulePreview 구조로) -------------------- */
  return (
    <div className="fixed top-30 right-3 z-50 w-[92vw] max-w-md">
      <Card className="relative border shadow-md">
        {/* 카드 헤더: 제목 + '접기' (ghost) — SchedulePreview와 동일한 톤 */}
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📝</span> 오늘의 할일 목록
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              해야 할 일을 빠르게 추가/완료하세요
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(true)}
            title="최소화"
          >
            접기
          </Button>
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
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              추가
            </Button>
          </div>

          {/* 목록: SchedulePreview의 아이템 카드 스타일로 통일 */}
          {loading ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              할 일이 없습니다.
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id}>
                  <div
                    className="w-full rounded-xl border bg-background/60
                               hover:bg-accent hover:text-accent-foreground
                               transition p-3 flex items-center gap-3"
                  >
                    <div className="flex-1 truncate text-sm">{t.content}</div>
                    {/* 완료 → 삭제 (체크박스 위치만 우측 고정) */}
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
