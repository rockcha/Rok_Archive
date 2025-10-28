"use client";
import type { Task } from "./types";
import { cn } from "./utils";

/**
 * 오늘의 Task 그리드
 * - DAILY는 항상 맨 앞(고정)
 * - DAY도 여기서는 체크/토글 불가 (상세보기에서만 가능)
 * - 카드 색상: 유형별 고정 톤 + 동일 톤의 호버
 * - 우상단 상태 아이콘: ✅ / ❌
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

  const renderCard = (t: Task) => {
    const statusEmoji = t.is_completed ? "✅" : "❌";
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
        {/* 상태 아이콘 (우상단) */}
        <div className="absolute top-2 right-2 text-base opacity-80">
          {statusEmoji}
        </div>
        <div className="font-medium text-center line-clamp-3 px-2">
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
