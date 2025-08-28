// src/components/FloatingTodo.tsx
"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useLocation } from "react-router-dom";
import { ListTodo } from "lucide-react";
import { useAdmin } from "@/features/Auth/useAdmin";
import { Switch } from "@/shared/ui/switch";

type Props = {
  offset?: { bottom?: number; right?: number };
  todoId?: string;
};

export default function FloatingTodo({ todoId = "todo" }: Props) {
  const { pathname } = useLocation();
  const isHome = pathname === "/main";
  const { isAdmin } = useAdmin();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLoadedRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dirty = useMemo(() => text !== lastLoadedRef.current, [text]);
  const [viewMode, setViewMode] = useState<"edit" | "view">("view");

  useEffect(() => {
    if (!open) return;
    let canceled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("todo_singleton")
          .select("content")
          .eq("id", todoId)
          .maybeSingle();
        if (error) throw error;
        const content = data?.content ?? "";
        if (!canceled) {
          setText(content);
          lastLoadedRef.current = content;
        }
      } catch (e) {
        if (!canceled)
          setError(e instanceof Error ? e.message : "불러오기 실패");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [open, todoId]);

  const saveIfDirty = useCallback(
    async (showToast = true) => {
      if (!dirty) return true;
      setSaving(true);
      setError(null);
      try {
        const { error } = await supabase
          .from("todo_singleton")
          .upsert({ id: todoId, content: text }, { onConflict: "id" });
        if (error) throw error;
        lastLoadedRef.current = text;
        if (showToast) toast.success("자동 저장됐습니다.");
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "저장 실패";
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dirty, todoId, text]
  );

  const closeAfterAutoSave = useCallback(async () => {
    const ok = await saveIfDirty(false);
    if (ok) setOpen(false);
  }, [saveIfDirty]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [open, dirty]);

  const handleOpen = () => {
    if (!isAdmin) {
      toast.error("관리자만 할 일 패널을 열 수 있습니다.");
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "m"
      ) {
        e.preventDefault();
        if (!isAdmin) {
          toast.error("관리자만 할 일 패널을 열 수 있습니다.");
          return;
        }
        if (open) closeAfterAutoSave();
        else setOpen(true);
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        closeAfterAutoSave();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, isAdmin, closeAfterAutoSave]); // ✅ deps 정리

  useEffect(() => {
    const onHide = () => {
      if (open) void saveIfDirty(false);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [open, saveIfDirty]); // ✅ deps 정리

  const linkify = (raw: string) => {
    const urlRegex =
      /((https?:\/\/[^\s]+)|(?:www\.[^\s]+(?:\.[^\s]+)+[^\s]*))/gi;
    const parts = raw.split(urlRegex);
    return parts.map((part, idx) => {
      if (!part) return null;
      if (part.match(urlRegex)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={`url-${idx}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 break-words"
          >
            {part}
          </a>
        );
      }
      const lines = part.split("\n");
      return lines.map((line, i) => (
        <span key={`t-${idx}-${i}`}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ));
    });
  };

  const toggleViewMode = async () => {
    if (viewMode === "edit") {
      const ok = await saveIfDirty(false);
      if (!ok) return;
      setViewMode("view");
    } else {
      setViewMode("edit");
    }
  };

  return (
    <>
      {!open && (
        <Button
          variant="outline"
          onClick={handleOpen}
          aria-label="할 일 열기"
          className={`${
            isHome ? "fixed z-[70] top-24 right-22" : ""
          } cursor-pointer [&>svg]:!h-4 [&>svg]:!w-4`}
        >
          <ListTodo className="text-neutral-600" />
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-[80]" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={closeAfterAutoSave}
          />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2">
            <div
              className="rounded-2xl bg-white shadow-2xl border"
              aria-busy={loading || saving}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 font-medium">
                  <span>✅</span>
                  <span>할 일</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {loading
                      ? "불러오는 중…"
                      : saving
                      ? "저장 중…"
                      : dirty
                      ? "수정됨"
                      : "최신"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`${
                      viewMode === "edit"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    편집
                  </span>
                  <Switch
                    checked={viewMode === "view"}
                    onCheckedChange={async () => {
                      await toggleViewMode();
                    }}
                    disabled={loading || saving}
                    aria-label="보기 모드로 전환"
                    className="hover:cursor-pointer"
                  />
                  <span
                    className={`${
                      viewMode === "view"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    보기
                  </span>
                </div>
              </div>

              <div className="p-3">
                {error && (
                  <div className="mb-2 text-xs text-red-600">{error}</div>
                )}
                <div className="relative">
                  {viewMode === "view" ? (
                    <div className="h-[60vh] min-h-[320px] overflow-auto rounded-lg border p-3 leading-6 prose prose-sm max-w-none break-words">
                      {linkify(text || "")}
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="할 일을 적어주세요…"
                      className="w-full h-[60vh] min-h-[320px] outline-none border rounded-lg p-3 pr-12 leading-6 resize-y disabled:opacity-60"
                      disabled={loading}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
