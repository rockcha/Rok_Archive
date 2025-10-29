"use client";
import type { Task } from "./types";
import { cn } from "./utils";
import { Check } from "lucide-react";

/**
 * 오늘의 Task 그리드 (체크 아이콘 유지 + 텍스트 빨간 line-through)
 * - 왼쪽 진행 보더 제거
 * - 완료 시 제목에 빨간 취소선
 */
export default function DayGrid({
  dailyItems,
  items,
  selectedId,
  onSelect,
}: {
  dailyItems: Task[];
  items: Task[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const toneByType = (t: Task) => {
    switch (t.type) {
      case "DAILY":
        return {
          base: "bg-emerald-50 border-emerald-200",
          hover: "hover:bg-emerald-100",
        };
      case "DUE":
        return {
          base: "bg-amber-50 border-amber-200",
          hover: "hover:bg-amber-100",
        };
      case "DAY":
      default:
        return {
          base: "bg-rose-50 border-rose-200",
          hover: "hover:bg-rose-100",
        };
    }
  };

  const StatusDot = ({ completed }: { completed: boolean }) => (
    <div
      className={cn(
        "absolute top-2 right-2 h-5 w-5 rounded-full grid place-items-center",
        completed
          ? "bg-emerald-500/90 ring-2 ring-white/70"
          : "bg-neutral-300/80 ring-2 ring-white/70"
      )}
      aria-label={completed ? "완료" : "미완료"}
    >
      {completed ? <Check className="h-3.5 w-3.5 text-white" /> : null}
    </div>
  );

  const renderCard = (t: Task) => {
    const tone = toneByType(t);
    return (
      <button
        key={t.id}
        onClick={() => onSelect(t.id)}
        className={cn(
          "relative aspect-square rounded-2xl border flex flex-col items-center justify-center p-3 transition-colors",
          "cursor-pointer",
          tone.base,
          tone.hover,
          selectedId === t.id ? "ring-2 ring-offset-2 ring-primary/40" : ""
        )}
        title={t.title || "(제목 없음)"}
      >
        {/* 상태 아이콘 (우상단 체크 유지) */}
        <StatusDot completed={!!t.is_completed} />

        {/* 제목: 완료 시 빨간 취소선 */}
        <div
          className={cn(
            "font-medium text-center line-clamp-3 px-2",
            t.is_completed
              ? "line-through decoration-rose-500 decoration-2 decoration-offset-2"
              : ""
          )}
        >
          {t.title || "(제목 없음)"}
        </div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl p-2">
      {dailyItems.length + items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          선택한 날짜에 Task가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* DAILY 고정 (맨 앞) */}
          {dailyItems.map(renderCard)}
          {/* DAY 목록 */}
          {items.map(renderCard)}
        </div>
      )}
    </div>
  );
}
