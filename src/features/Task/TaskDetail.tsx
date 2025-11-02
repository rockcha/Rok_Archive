"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  CircleX,
  PencilLine,
  Save,
  X,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import type { Task } from "./types";
import { faviconUrl } from "./utils";

/**
 * TaskDetail – 헤더 바에 [유형 뱃지 + 제목] 배치, 아래로 메모/링크
 */
export default function TaskDetail({
  task,
  onPatch,
  onDelete,
}: {
  task: Task | null;
  onPatch: (patch: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showDueEdit, setShowDueEdit] = useState(false);
  const dueInputRef = useRef<HTMLInputElement | null>(null);
  const memoRef = useRef<HTMLTextAreaElement | null>(null);

  // 파생값(널-세이프)
  const isCompleted = !!task?.is_completed;
  const taskType: Task["type"] = (task?.type as Task["type"]) ?? "DAY";

  // 메모 자동높이
  useEffect(() => {
    if (!isEditing || !memoRef.current) return;
    const ta = memoRef.current;
    const handler = () => {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    };
    handler();
    ta.addEventListener("input", handler);
    return () => ta.removeEventListener("input", handler);
  }, [isEditing]);

  // 완료 토글 (useCallback로 경고 제거)
  const setCompleted = useCallback(
    (flag: boolean) => onPatch({ is_completed: flag }),
    [onPatch]
  );

  const handleAddLink = () => {
    const url = (newUrl || "").trim();
    if (!url || !task) return;
    onPatch({ links: [...(task.links || []), url] });
    setNewUrl("");
  };

  const onUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!task) return;
    const text = e.clipboardData.getData("text");
    const urls = (text || "")
      .split(/[\s\n]+/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s));
    if (urls.length > 1) {
      e.preventDefault();
      onPatch({ links: [...(task.links || []), ...urls] });
      setNewUrl("");
    }
  };

  // 상태/톤
  const status = isCompleted
    ? {
        bg: "bg-emerald-600",
        border: "border-emerald-700/30",
        label: "완료됨",
        icon: CheckCircle2,
      }
    : {
        bg: "bg-rose-600",
        border: "border-rose-700/30",
        label: "미완료",
        icon: CircleX,
      };
  const StatusIcon = status.icon;

  const toneByType = useMemo(() => {
    switch (taskType) {
      case "DAILY":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "DUE":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "DAY":
      default:
        return "bg-sky-50 border-sky-200 text-sky-700";
    }
  }, [taskType]);

  // 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "t" && task) setCompleted(!isCompleted);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsEditing(false);
      }
      if (e.key === "e") setIsEditing(true);
      if (e.key === "Escape") setIsEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCompleted, task, setCompleted]);

  // DUE 저장: Task 타입은 date: string | undefined
  const saveDue = () => {
    const v = dueInputRef.current?.value?.trim() || "";
    onPatch({ date: v || undefined });
    setShowDueEdit(false);
  };

  // 안전 분기
  if (!task)
    return (
      <div className="text-sm text-muted-foreground">
        왼쪽 목록에서 Task를 선택하세요.
      </div>
    );

  return (
    <div className="relative pb-20 sm:pb-16">
      {/* 헤더 바 */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              "shrink-0 text-[11px] px-2 py-0.5 rounded-full border",
              toneByType,
            ].join(" ")}
            title="유형"
          >
            {taskType}
          </span>

          {isEditing ? (
            <Input
              value={task.title || ""}
              onChange={(e) => onPatch({ title: e.target.value })}
              placeholder="제목을 입력하세요"
              autoFocus
              className="flex-1 text-[20px] sm:text-[22px] font-semibold"
            />
          ) : (
            <h2 className="flex-1 text-[20px] sm:text-[22px] font-semibold truncate">
              {task.title?.trim() ? (
                task.title
              ) : (
                <span className="text-muted-foreground">(제목 없음)</span>
              )}
            </h2>
          )}

          {/* DUE 전용 버튼 */}
          {taskType === "DUE" && (
            <button
              type="button"
              onClick={() => setShowDueEdit(true)}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs rounded-md border px-2 py-1 hover:bg-muted/60 transition cursor-pointer"
              title="마감일 편집"
            >
              <CalendarDays className="w-3.5 h-3.5 opacity-80" />
              {task.date ? `마감: ${task.date}` : "마감 설정"}
            </button>
          )}
        </div>
        <div className="mt-2 h-px bg-border/60" />
      </div>

      {/* 메모 */}
      <SectionCard title="메모">
        {isEditing ? (
          <Textarea
            ref={memoRef}
            rows={6}
            className="text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 rounded-xl"
            value={task.memo || ""}
            onChange={(e) => onPatch({ memo: e.target.value })}
            placeholder="세부 메모를 적어주세요"
            spellCheck={false}
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm">
            {task.memo?.trim() ? (
              task.memo
            ) : (
              <span className="text-muted-foreground">(메모 없음)</span>
            )}
          </div>
        )}
      </SectionCard>

      {/* 링크 */}
      <SectionCard title="링크">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(task.links || []).map((link, idx) => (
            <div
              key={`${link}-${idx}`}
              className="group flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/40 transition cursor-pointer"
              title={link}
            >
              <img
                src={faviconUrl(link)}
                alt=""
                className="w-5 h-5 rounded-sm opacity-90"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0 flex-1">
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline decoration-dotted truncate block"
                >
                  <LinkIcon className="w-4 h-4 inline mr-1 opacity-80" />
                  {link}
                </a>
                <p className="text-[11px] text-muted-foreground truncate">
                  {safeHostname(link)}
                </p>
              </div>

              {isEditing && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() =>
                    onPatch({
                      links: (task.links || []).filter((_, i) => i !== idx),
                    })
                  }
                  title="링크 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onPaste={onUrlPaste}
              placeholder="https:// 링크 추가 (여러 줄 붙여넣기 지원)"
            />
            <Button
              variant="outline"
              className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition"
              onClick={handleAddLink}
              title="링크 추가"
            >
              추가
            </Button>
          </div>
        )}
      </SectionCard>

      {/* 완료 토글 FAB */}
      <button
        type="button"
        aria-label={
          isCompleted
            ? "완료 상태, 클릭하여 미완료로"
            : "미완료 상태, 클릭하여 완료로"
        }
        onClick={() => setCompleted(!isCompleted)}
        className={[
          "fixed sm:absolute bottom-3 right-3 sm:bottom-2 sm:right-2 z-20",
          "rounded-full shadow-lg border px-4 py-3 text-white",
          "transition-all duration-200 cursor-pointer active:scale-95",
          status.border,
          "hover:opacity-90",
          status.bg,
        ].join(" ")}
      >
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">{status.label}</span>
        </div>
      </button>

      {/* 좌하단 액션바 */}
      <div className="fixed sm:absolute bottom-3 left-3 sm:bottom-2 sm:left-2 z-20 flex items-center gap-2">
        {!isEditing ? (
          <>
            <Button
              size="icon"
              variant="destructive"
              className="cursor-pointer hover:opacity-90 active:scale-95 transition"
              onClick={() => setShowDelete(true)}
              title="삭제"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="cursor-pointer hover:opacity-90 active:scale-95 transition"
              onClick={() => setIsEditing(true)}
              title="수정"
            >
              <PencilLine className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="icon"
              variant="default"
              className="cursor-pointer hover:opacity-90 active:scale-95 transition"
              onClick={() => setIsEditing(false)}
              title="저장"
            >
              <Save className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="cursor-pointer hover:opacity-90 active:scale-95 transition"
              onClick={() => setIsEditing(false)}
              title="취소"
            >
              <X className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이 작업을 삭제할까요?</DialogTitle>
            <DialogDescription>
              삭제하면 복구할 수 없어요. 정말로 삭제하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDelete(false);
                onDelete();
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DUE 마감일 편집 다이얼로그 */}
      <Dialog open={showDueEdit} onOpenChange={setShowDueEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>마감일 설정</DialogTitle>
            <DialogDescription>
              YYYY-MM-DD 형식으로 입력하거나 비워두면 해제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              ref={dueInputRef}
              defaultValue={task.date ?? ""}
              placeholder="예: 2025-11-05"
            />
            <Button variant="outline" onClick={() => setShowDueEdit(false)}>
              취소
            </Button>
            <Button onClick={saveDue}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ======================= 섹션 카드 ======================= */
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 mb-3 last:mb-0">
      <header className="mb-2 text-[12px] font-medium text-muted-foreground">
        {title}
      </header>
      {children}
    </section>
  );
}

/* 안전한 hostname 추출 */
function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
