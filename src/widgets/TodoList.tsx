// src/features/todos/TodoList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "@/features/Auth/useAdmin";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";

// ▼ shadcn tooltip (프로젝트에 이미 있다면 경로 동일)
// 없다면 "@/shared/ui/tooltip" 경로에 맞게 바꿔줘.
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

type TodoRow = {
  id: string;
  content: string;
  isDaily: boolean;
};

export default function TodoList() {
  const [collapsed, setCollapsed] = useState(true);
  const [items, setItems] = useState<TodoRow[]>([]);
  const [content, setContent] = useState("");
  const [isDailyNew, setIsDailyNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const { isAdmin, hydrated, checkSession } = useAdmin();

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("todo")
        .select("id, content, isDaily")
        .order("isDaily", { ascending: false })
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
    if (hydrated && isAdmin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAdmin]);

  const handleAdd = async () => {
    const text = content.trim();
    if (!text) return;
    try {
      await supabase
        .from("todo")
        .insert({ content: text, isDaily: isDailyNew })
        .select("id, content, isDaily")
        .single();
      await loadAll();
      setContent("");
      setIsDailyNew(false);
    } catch (e) {
      console.error("add error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setItems((p) => p.filter((x) => x.id !== id));
      const { error } = await supabase.from("todo").delete().eq("id", id);
      if (error) throw error;
      setDoneIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (e) {
      console.error("delete error:", e);
      loadAll();
    }
  };

  const toggleDone = (id: string, checked: boolean | "indeterminate") => {
    setDoneIds((prev) => {
      const n = new Set(prev);
      if (checked === true) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const sections = useMemo(() => {
    const daily = items.filter((i) => i.isDaily);
    const normal = items.filter((i) => !i.isDaily);
    return { daily, normal };
  }, [items]);

  if (!hydrated) return null;

  return (
    <div className="fixed top-28 right-50 z-50 w-[21rem] max-w-none hidden md:block">
      <Card className="relative border shadow-md max-h-[70vh] flex flex-col pr-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>📌</span> 오늘의 할일{" "}
              <span className="text-sm text-muted-foreground">
                ({items.length})
              </span>
            </CardTitle>
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

        <CardContent
          className={
            collapsed
              ? "hidden"
              : `
                 space-y-4 overflow-y-auto flex-1 pr-1
                 [scrollbar-width:thin] [-ms-overflow-style:auto]
                 [&::-webkit-scrollbar]:w-2
                 [&::-webkit-scrollbar-thumb]:rounded-full
                 [&::-webkit-scrollbar-thumb]:bg-zinc-300/70
                 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/70
               `
          }
        >
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
              {/* 입력 + (버튼 자리) 데일리 체크박스 */}
              <div className="flex items-center gap-3">
                <Input
                  placeholder="할 일을 입력하세요 "
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 select-none">
                        <Checkbox
                          id="isDailyNew"
                          checked={isDailyNew}
                          onCheckedChange={(v) => setIsDailyNew(v === true)}
                          aria-label="매일 반복"
                          className="hover:cursor-pointer hover:bg-gray-200"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Daily 여부 체크
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* 데일리 섹션 */}
              {sections.daily.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-700/80">
                    매일 할 일
                  </div>
                  <ul className="space-y-2">
                    {sections.daily.map((t) => {
                      const done = doneIds.has(t.id);
                      return (
                        <li key={t.id}>
                          <div
                            className={`w-full rounded-xl border bg-background/60 transition p-3 flex items-center gap-3 ${
                              done ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <Checkbox
                              checked={done}
                              onCheckedChange={(v) => toggleDone(t.id, v)}
                              aria-label="완료 표시"
                              className="hover:cursor-pointer hover:bg-gray-200"
                            />
                            <div className="flex-1 truncate text-sm">
                              {t.content}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-50 hover:cursor-pointer hover:text-red-600"
                              onClick={() => handleDelete(t.id)}
                              aria-label="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* 일반 섹션 */}
              <div className="space-y-2">
                {sections.daily.length > 0 && (
                  <div className="h-px w-full bg-border my-3" />
                )}
                <div className="text-xs font-semibold text-zinc-600/90">
                  할 일
                </div>
                {sections.normal.length === 0 ? (
                  <div className="py-3 text-center text-sm text-zinc-500">
                    할 일이 없습니다.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {sections.normal.map((t) => {
                      const done = doneIds.has(t.id);
                      return (
                        <li key={t.id}>
                          <div
                            className={`w-full rounded-xl border bg-background/60 transition p-3 flex items-center gap-3 ${
                              done ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <Checkbox
                              checked={done}
                              onCheckedChange={(v) => toggleDone(t.id, v)}
                              aria-label="완료 표시"
                              className="hover:cursor-pointer hover:bg-gray-200"
                            />
                            <div className="flex-1 truncate text-sm">
                              {t.content}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-50 hover:cursor-pointer hover:text-red-600"
                              onClick={() => handleDelete(t.id)}
                              aria-label="삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
