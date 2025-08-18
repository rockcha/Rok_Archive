import { useMemo } from "react";
import type { Schedule } from "@/pages/SchedularPage";

import { cn } from "@/shared/lib/utils";

type Props = {
  monthDate: Date; // 해당 월(아무 날이어도 됨)
  schedules: Schedule[]; // 그 달 범위 데이터
  onOpenDetail: (sch: Schedule) => void;
  loading?: boolean;
};
const todayStr = new Date().toLocaleDateString("sv-SE"); // "YYYY-MM-DD"
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

function ymd(d: Date) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).toLocaleDateString("sv-SE");
}

export function CalendarGrid({
  monthDate,
  schedules,
  onOpenDetail,
  loading,
}: Props) {
  const view = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstWeekday = first.getDay(); // 0~6
    const daysInMonth = last.getDate(); // 28~31

    // 6주 x 7일 고정 그리드
    const cells: (Date | null)[] = [];
    // 앞쪽 지난달 자리
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    // 뒤쪽 다음달 자리
    while (cells.length < 42) cells.push(null);

    return { first, last, cells };
  }, [monthDate]);

  const byDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of schedules) {
      const key = s.date; // "YYYY-MM-DD"
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    // 정렬: title 기준 or 입력순 필요시 created_at 쓰면 됨
    for (const k of map.keys()) {
      map.get(k)!.sort((a, b) => a.title.localeCompare(b.title));
    }
    return map;
  }, [schedules]);

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-sm font-medium text-muted-foreground mb-1">
        {dayNames.map((d) => (
          <div key={d} className="px-3 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* 7x6 그리드: 각 셀을 정사각형으로 */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden border">
        {view.cells.map((date, idx) => {
          const isCurrentMonth =
            date && date.getMonth() === monthDate.getMonth();
          const key = date ? ymd(date) : `null-${idx}`;
          const list = date ? byDate.get(key) ?? [] : [];

          return (
            <div
              key={key}
              className={cn(
                "relative aspect-square bg-background transition",

                !isCurrentMonth && "bg-muted/30 text-muted-foreground"
              )}
            >
              {/* 내부 컨텐츠는 셀을 가득 채우도록 */}
              <div className="absolute inset-0">
                {/* 날짜: 좌상단 */}
                {/* 날짜: 좌상단 */}
                <div className="absolute top-2 left-3 text-sm">
                  {date ? (
                    // 오늘이면 빨간 동그라미
                    key === todayStr ? (
                      <span
                        className="inline-flex items-center justify-center
                       w-6 h-6 rounded-full border border-red-500
                       text-red-600 font-medium"
                      >
                        {date.getDate()}
                      </span>
                    ) : (
                      <span>{date.getDate()}</span>
                    )
                  ) : null}
                </div>

                {/* 일정 리스트: 날짜 아래로 세로 스택, 넘치면 스크롤 */}
                <div className="h-full pt-7 pb-2 px-2 overflow-y-auto space-y-1.5">
                  {list.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left"
                      onClick={() => onOpenDetail(s)}
                      title={s.title}
                    >
                      <span
                        className="inline-flex w-full truncate justify-start
               rounded-md border bg-secondary px-2 py-1 text-xs
               hover:bg-secondary/80 hover:border-muted-foreground/50 transition hover:cursor-pointer"
                      >
                        {s.title}
                      </span>
                    </button>
                  ))}
                  {loading && list.length === 0 && isCurrentMonth && (
                    <div className="text-xs text-muted-foreground">
                      불러오는 중…
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
