// src/features/todos/TodoList.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "@/features/Auth/useAdmin";

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

  // 권한 제어
  const { isAdmin, hydrated, checkSession } = useAdmin();

  useEffect(() => {
    // 세션 상태 동기화 (깜빡임 방지용)
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (hydrated && isAdmin) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAdmin]);

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

  // 초기 로딩(세션 수화 전)엔 아무것도 안 보여 깜빡임 방지
  if (!hydrated) return null;

  return (
    <div className="fixed top-28 right-10 z-50 w-[18rem] max-w-none hidden md:block">
      <Card className="relative border shadow-md">
        {/* ✅ 헤더/멘트/위치 통일 (접힘/펼침 동일) */}
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📌</span> 오늘의 할일 목록
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              현재 할 일 <span className="font-medium">{items.length}</span>개가
              있어요
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "펼치기" : "접기"}
            className="hover:cursor-pointer"
          >
            {collapsed ? "펼치기" : "접기"}
          </Button>
        </CardHeader>

        {/* ✅ 본문은 권한/접힘 상태에 따라 제어 (레이아웃 흔들림 최소화) */}
        <CardContent className={collapsed ? "hidden" : "space-y-3"}>
          {!isAdmin ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              관리자에게만 공개되는 내용입니다.
            </div>
          ) : loading ? (
            <div className="py-6 text-center text-sm text-zinc-500">
              불러오는 중…
            </div>
          ) : (
            <>
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
                  className="bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer"
                >
                  추가
                </Button>
              </div>

              {/* 목록 */}
              {items.length === 0 ? (
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
                        <div className="flex-1 truncate text-sm">
                          {t.content}
                        </div>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
