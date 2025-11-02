"use client";
import { CheckCircle } from "lucide-react";
import type { Task } from "./types";
import { cn } from "./utils";

export default function DailyList({
  items,
  onToggle,
  onSelect,
  selectedId,
}: {
  items: Task[];
  onToggle: (t: Task) => void;
  onSelect: (id: number) => void;
  selectedId: number | null;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-neutral-600">
        매일 하는 일 (DAILY)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative h-24 rounded-xl border flex flex-col items-center justify-center p-2 transition-all",
              "hover:cursor-pointer hover:-translate-y-[1px] hover:shadow-sm",
              t.is_completed
                ? "bg-emerald-50 border-emerald-100"
                : "bg-emerald-50/50 border-emerald-100",
              selectedId === t.id
                ? "ring-2 ring-offset-2 ring-primary/50 outline-none"
                : ""
            )}
            title="클릭해서 상세 편집"
          >
            {/* 완료 토글 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(t);
              }}
              className={cn(
                "absolute top-2 right-2 h-6 w-6 rounded-full border flex items-center justify-center shadow-sm",
                t.is_completed
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-white/90 text-foreground/70 border-muted hover:bg-white"
              )}
              aria-label={t.is_completed ? "완료 해제" : "완료"}
              title={t.is_completed ? "완료 해제" : "완료"}
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            <div
              className={cn(
                "text-sm font-medium text-center line-clamp-2 px-2",
                t.is_completed && "opacity-90"
              )}
              title={t.title || "(제목 없음)"}
            >
              {t.title || "(제목 없음)"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
