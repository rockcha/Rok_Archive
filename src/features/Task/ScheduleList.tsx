"use client";
import { dday } from "./utils";
import type { Schedule } from "./types";

export default function ScheduleList({ items }: { items: Schedule[] }) {
  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground px-2">
        다가오는 스케쥴이 없습니다.
      </div>
    );
  }
  return (
    <div className="p-2 space-y-2">
      {items.map((s) => {
        const d = dday(s.date);
        return (
          <div
            key={s.id}
            className="rounded-lg border p-3 transition-all bg-white/80 hover:bg-white hover:shadow-sm"
            title={s.title}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(s.date + "T00:00:00").toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
              <div
                className={[
                  "text-xs px-2 py-1 rounded-full whitespace-nowrap border",
                  d.value === 0
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : d.value > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200",
                ].join(" ")}
              >
                {d.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
