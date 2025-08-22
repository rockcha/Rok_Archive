// src/components/FloatingMemo.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

type Props = {
  offset?: { bottom?: number; right?: number };
  memoId?: string; // memo_singleton PK
};

export default function FloatingMemo({ memoId = "memo" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLoadedRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dirty = useMemo(() => text !== lastLoadedRef.current, [text]);

  // 열릴 때마다 서버에서 최신 content 가져오기
  useEffect(() => {
    if (!open) return;
    let canceled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("memo_singleton")
          .select("content")
          .eq("id", memoId)
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

    // beforeunload 경고 임시 비활성화
    const prev = window.onbeforeunload;
    window.onbeforeunload = null;
    return () => {
      canceled = true;
      window.onbeforeunload = prev;
    };
  }, [open, memoId]);

  // 저장 로직 (필요할 때만)
  const saveIfDirty = async (showToast = true) => {
    if (!dirty) return true;
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("memo_singleton")
        .upsert({ id: memoId, content: text }, { onConflict: "id" });
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
  };

  // 닫기(오버레이/ESC/단축키) → 자동 저장 후 닫기
  const closeAfterAutoSave = async () => {
    const ok = await saveIfDirty(false); // 실패 시 닫지 않음
    if (ok) setOpen(false);
  };

  // ESC & 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 토글 단축키
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "m"
      ) {
        e.preventDefault();
        if (open) closeAfterAutoSave();
        else setOpen(true);
      }
      // ESC로 닫기
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
  }, [open, dirty, text]);

  // 탭 전환/브라우저 숨김 시에도 최대한 저장 시도
  useEffect(() => {
    const onHide = () => {
      if (open) saveIfDirty(false);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [open, text, dirty]);

  // 커서 위치에 '📌 ' 삽입 (스크롤 점프 방지)
  const insertPinAtCaret = () => {
    if (!textareaRef.current) {
      setText((prev) => (prev ? `${prev}\n📌 ` : `📌 `));
      return;
    }
    const el = textareaRef.current;

    // 1) 현재 선택/스크롤 상태 저장
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const prevScrollTop = el.scrollTop;

    // 2) 텍스트 계산
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    const insert = "📌 ";
    const next = `${before}${insert}${selected}${after}`;

    // 3) 상태 업데이트 (리렌더)
    setText(next);

    // 4) 다음 프레임에서 포커스/선택/스크롤 복구
    const caretStart = start + insert.length;
    const caretEnd = caretStart + selected.length;

    requestAnimationFrame(() => {
      (el as any).focus?.({ preventScroll: true });
      el.setSelectionRange(caretStart, caretEnd);
      el.scrollTop = prevScrollTop;
      // iOS/Safari 보강
      requestAnimationFrame(() => {
        el.scrollTop = prevScrollTop;
      });
    });
  };

  return (
    <>
      {/* 접힌 상태: 고정 배지 */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          variant="secondary"
          className="fixed z-[70] right-10 top-[32%] rounded-full backdrop-blur px-3 py-2 shadow-lg border text-sm cursor-pointer hover:opacity-95"
          aria-label="메모장 열기"
        >
          <span className="mr-1">🗒️</span>
          <span className="align-middle">메모장</span>
        </Button>
      )}

      {/* 펼친 상태: 오버레이 + 중앙 카드 */}
      {open && (
        <div className="fixed inset-0 z-[80]" aria-modal="true" role="dialog">
          {/* 오버레이 클릭 → 자동 저장 후 닫기 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={closeAfterAutoSave}
          />

          {/* 중앙 카드 */}
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2">
            <div
              className="rounded-2xl bg-white shadow-2xl border"
              aria-busy={loading || saving}
              onClick={(e) => e.stopPropagation()} // 카드 내부 클릭 시 닫힘 방지
            >
              {/* 헤더(상태만 표시) */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2 font-medium">
                  <span>🗒️</span>
                  <span>메모장</span>
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
                <span className="text-xs text-muted-foreground">
                  ESC 또는 바깥 클릭 시 자동 저장
                </span>
              </div>

              {/* 바디 */}
              <div className="p-3">
                {error && (
                  <div className="mb-2 text-xs text-red-600">{error}</div>
                )}

                {/* textarea 래퍼를 relative로 감싸고, 내부 우하단에 FAB 배치 */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="여기에 메모를 적어주세요…"
                    className="w-full h-[60vh] min-h-[320px] outline-none border rounded-lg p-3 pr-12 leading-6 resize-y disabled:opacity-60"
                    disabled={loading}
                  />

                  {/* 메모장 우하단 📌 버튼 (카드 내부 고정) */}
                  <button
                    type="button"
                    onClick={insertPinAtCaret}
                    aria-label="글머리기호 추가"
                    className="
                      absolute bottom-3 right-3 z-10
                      h-10 w-10 rounded-full
                      bg-white border shadow-md
                      flex items-center justify-center
                      text-xl
                      cursor-pointer
                      transition
                      hover:scale-105 hover:shadow-lg hover:bg-white
                      active:scale-95
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-300
                    "
                  >
                    <span className="select-none">📌</span>
                  </button>
                </div>

                <div className="flex justify-end items-center pt-2 text-xs text-muted-foreground">
                  <span>{text.length}자</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
