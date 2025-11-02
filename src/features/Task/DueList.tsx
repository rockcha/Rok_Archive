"use client";
import type { Task } from "./types";
import { dday, weekdayKR, cn } from "./utils";

/**
 * 다가오는 Task 리스트 (미니멀)
 * - 좌측 강조(띠) 제거
 * - 통일된 카드 스타일
 * - D-표기 뱃지
 */
export default function DueList({
  items,
  onClick,
}: {
  items: Task[];
  onClick: (t: Task) => void;
}) {
  if (items.length === 0)
    return (
      <div className="text-sm text-muted-foreground px-2">
        다가오는 Task가 없습니다.
      </div>
    );

  return (
    <div className="p-2 space-y-3">
      {items.map((t) => {
        const d = dday(t.date);
        return (
          <button
            key={t.id}
            onClick={() => onClick(t)}
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-all bg-white/80 hover:bg-white hover:shadow-sm hover:-translate-y-0.5"
            )}
            title="클릭해서 상세 보기"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {t.title || "(제목 없음)"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(t.date + "T00:00:00").toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}{" "}
                  ({weekdayKR(new Date(t.date + "T00:00:00"))})
                </div>
              </div>
              <div
                className={cn(
                  "text-xs px-2 py-1 rounded-full whitespace-nowrap border",
                  d.value === 0
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : d.value > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                )}
              >
                {d.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
