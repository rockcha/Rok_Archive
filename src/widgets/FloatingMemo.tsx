// src/components/FloatingMemo.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useLocation } from "react-router-dom";
import { Notebook } from "lucide-react";
import { useAdmin } from "@/features/Auth/useAdmin"; // ✅ 추가

type Props = {
  offset?: { bottom?: number; right?: number };
  memoId?: string; // memo_singleton PK
};

export default function FloatingMemo({ memoId = "memo" }: Props) {
  const { pathname } = useLocation();
  const isHome = pathname === "/main";
  const { isAdmin } = useAdmin(); // ✅ 관리자 여부

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLoadedRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dirty = useMemo(() => text !== lastLoadedRef.current, [text]);

  // 열릴 때마다 서버에서 최신 content 가져오기 (원본 유지)
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

  // 저장 로직 (원본 유지)
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

  // 닫기(오버레이/ESC/단축키) → 자동 저장 후 닫기 (원본 유지)
  const closeAfterAutoSave = async () => {
    const ok = await saveIfDirty(false);
    if (ok) setOpen(false);
  };

  // ✅ 메모장 열기 전에 관리자 체크만 추가 (기존 로직 보존)
  const handleOpen = () => {
    if (!isAdmin) {
      toast.error("관리자만 메모장을 열 수 있습니다.");
      return;
    }
    setOpen(true);
  };

  // ESC & 단축키 (원본 로직 유지 + admin 체크만 추가)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 토글 단축키
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "m"
      ) {
        e.preventDefault();
        if (!isAdmin) {
          toast.error("관리자만 메모장을 열 수 있습니다.");
          return;
        }
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
  }, [open, dirty, text, isAdmin]);

  // 탭 전환/브라우저 숨김 시에도 최대한 저장 시도 (원본 유지)
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

  // 커서 위치에 '📌 ' 삽입 (원본 유지)
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
      el.focus({ preventScroll: true });
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
      {/* 접힌 상태: 아이콘 + “메모장” */}
      {!open && (
        <Button
          variant="ghost"
          onClick={handleOpen}
          aria-label="메모장 열기"
          className={`
           ${isHome ? "fixed z-[70] bottom-12 right-12" : ""}
           cursor-pointer
            [&>svg]:!h-6 [&>svg]:!w-6
          `}
        >
          <Notebook className="text-neutral-600" />
        </Button>
      )}

      {/* 펼친 상태: 오버레이 + 중앙 카드 (원본 유지) */}
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
                      absolute top-3 right-5 z-10
                      h-10 w-10 rounded-full
                     
                      flex items-center justify-center
                      text-base
                      cursor-pointer
                    "
                  >
                    <span>📌</span>
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
