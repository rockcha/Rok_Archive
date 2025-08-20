// src/features/todos/TodoList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "@/features/Auth/useAdmin";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";

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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");

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

  const openPreview = (text: string) => {
    setPreviewText(text);
    setPreviewOpen(true);
  };

  const sections = useMemo(() => {
    const daily = items.filter((i) => i.isDaily);
    const normal = items.filter((i) => !i.isDaily);
    return { daily, normal };
  }, [items]);

  if (!hydrated) return null;

  return (
    <>
      {/* 💡 오른쪽 고정 카드 - 폭 넉넉하게 (22rem) */}
      <div className="fixed top-28 lg:right-0 xl:right-50 z-50 w-[8rem] hidden md:block">
        <Card
          className={
            collapsed
              ? "relative w-full shadow-md rounded-2xl border"
              : "relative w-full shadow-md rounded-2xl border flex flex-col max-h-[70vh] pr-4"
          }
        >
          {collapsed ? (
            // 접힌 상태
            <CardHeader
              className="p-1 cursor-pointer"
              onClick={() => setCollapsed(false)}
            >
              <CardTitle className="text-xs flex items-center justify-center gap-1">
                <span>📌</span> 오늘의 할일
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({items.length})
                </span>
              </CardTitle>
            </CardHeader>
          ) : (
            // 펼친 상태
            <CardHeader className="flex items-center justify-center ">
              <div>
                <CardTitle className="flex items-center  gap-2 text-lg">
                  <span>📌</span> 오늘의 할일
                  <span className="text-sm text-muted-foreground">
                    ({items.length})
                  </span>
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(true)}
                className="hover:cursor-pointer"
              >
                접기
              </Button>
            </CardHeader>
          )}

          {/* 내용 */}
          <CardContent
            className={
              collapsed
                ? "hidden"
                : `space-y-4 overflow-y-auto flex-1 pr-1
           [scrollbar-width:thin] [-ms-overflow-style:auto]
           [&::-webkit-scrollbar]:w-2
           [&::-webkit-scrollbar-thumb]:rounded-full
           [&::-webkit-scrollbar-thumb]:bg-zinc-300/70
           dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/70`
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
                {/* 입력 + Daily 체크 */}
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="할 일을 입력하세요 "
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="bg-sky-100 border-2 border-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-inherit"
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
                            className="border-2 border-gray-400 hover:cursor-pointer bg-white"
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
                              role="button"
                              tabIndex={0}
                              onClick={() => openPreview(t.content)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && openPreview(t.content)
                              }
                              className={`w-full rounded-xl border border-gray-400 bg-background/60 transition p-3 flex items-center gap-3 hover:bg-green-200 hover:cursor-pointer ${
                                done ? "opacity-60 line-through" : ""
                              }`}
                            >
                              <Checkbox
                                checked={done}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onCheckedChange={(v) => toggleDone(t.id, v)}
                                aria-label="완료 표시"
                                className="border-gray-400 hover:cursor-pointer bg-white"
                              />
                              <div className="flex-1 truncate text-sm">
                                {t.content}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:cursor-pointer hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(t.id);
                                }}
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
                    <div className="h-px w-full bg-gray-500 my-3" />
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
                              role="button"
                              tabIndex={0}
                              onClick={() => openPreview(t.content)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && openPreview(t.content)
                              }
                              className={`w-full rounded-xl border border-gray-400 bg-background/60 transition p-3 flex items-center gap-3 hover:bg-green-200 hover:text-accent-foreground hover:cursor-pointer ${
                                done ? "opacity-60 line-through" : ""
                              }`}
                            >
                              <Checkbox
                                checked={done}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onCheckedChange={(v) => toggleDone(t.id, v)}
                                aria-label="완료 표시"
                                className="hover:cursor-pointer bg-white border-gray-400"
                              />
                              <div className="flex-1 truncate text-sm">
                                {t.content}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:cursor-pointer hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(t.id);
                                }}
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

      {/* 전체 내용 미리보기 다이얼로그 */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>할 일 전체 보기</DialogTitle>
            <DialogDescription className="sr-only">
              선택한 할 일의 전체 내용을 표시합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {previewText}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
