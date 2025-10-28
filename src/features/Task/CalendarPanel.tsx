"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { Task, Schedule } from "./types";
import { fetchSchedulesInRange } from "./api";
import { toYMD } from "./utils";

/* 날짜 유틸 */
function ymd(d: Date) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).toLocaleDateString("sv-SE");
}
function firstOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

type MonthMap = Record<
  string,
  { day: Task[]; due: Task[]; daily: Task[]; schedule?: number }
>;

export default function CalendarPanel({
  monthMap,
  selectedYMD,
  onPickDate,
  onRangeChange,
}: {
  monthMap: MonthMap;
  selectedYMD: string;
  onPickDate?: (ymd: string) => void;
  onRangeChange?: (startYMD: string, endYMD: string) => Promise<void>;
}) {
  const [cursor, setCursor] = useState<Date>(() => firstOfMonth(new Date()));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rangeKey, setRangeKey] = useState<string>(""); // key 안정화로 깜빡임 최소화

  const range = useMemo(() => {
    const start = firstOfMonth(cursor);
    const end = lastOfMonth(cursor);
    return { start, end, startStr: ymd(start), endStr: ymd(end) };
  }, [cursor]);

  // 월 범위 스케쥴 조회 & 상위에 월맵 요청
  useEffect(() => {
    let mounted = true;
    (async () => {
      // 상위에 월맵 로드 요청 (DAY/DUE 카운트 일관성 위해)
      if (onRangeChange) await onRangeChange(range.startStr, range.endStr);
      const list = await fetchSchedulesInRange(range.startStr, range.endStr);
      if (!mounted) return;
      setSchedules(list);
      setRangeKey(`${range.startStr}:${range.endStr}`); // grid key 안정화
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.startStr, range.endStr]);

  // 요일 헤더
  const weekday = ["일", "월", "화", "수", "목", "금", "토"];

  // 그리드 날짜 생성 (깜빡임 최소화를 위해 key 고정화)
  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startIdx = first.getDay(); // 0:일
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startIdx; i++) arr.push(null);
    const last = lastOfMonth(cursor).getDate();
    for (let d = 1; d <= last; d++)
      arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return arr;
  }, [cursor]);

  // 스케쥴 카운트 맵
  const scheduleMap = useMemo(() => {
    const m: Record<string, number> = {};
    schedules.forEach((s) => {
      m[s.date] = (m[s.date] || 0) + 1;
    });
    return m;
  }, [schedules]);

  const todayYMD = toYMD(new Date());

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <Button
            variant="outline"
            onClick={() =>
              setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
            }
            className="hover:cursor-pointer"
          >
            이전 달
          </Button>
        </div>
        <CardTitle className="justify-self-center text-xl select-none">
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </CardTitle>
        <div className="justify-self-end">
          <Button
            variant="outline"
            onClick={() =>
              setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
            }
            className="hover:cursor-pointer"
          >
            다음 달
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 요일 */}
        <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground mb-2">
          {weekday.map((d) => (
            <div key={d} className="text-center select-none">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div key={rangeKey} className="grid grid-cols-7 gap-2">
          {days.map((d, idx) => {
            if (!d) {
              return <div key={`blank-${idx}`} className="h-24" />;
            }
            const k = ymd(d);
            const m = monthMap[k];
            const dayCnt = m?.day?.length ?? 0;
            const dueCnt = m?.due?.length ?? 0;
            const schCnt = scheduleMap[k] ?? 0;

            // “내용이 있는 날”만 칩(사각형)을 표시 — DAILY는 제외
            const hasAny = dayCnt + dueCnt + schCnt > 0;

            // 배경 규칙: 선택일(emerald), 그 외 오늘은 neutral
            const isToday = k === todayYMD;
            const isSelected = k === selectedYMD;
            const bg = isSelected
              ? "bg-emerald-50"
              : isToday
              ? "bg-neutral-50"
              : "bg-white/70";

            return (
              <button
                key={k}
                onClick={() => onPickDate && onPickDate(k)}
                className={`relative h-24 rounded-xl border text-left p-2 transition 
                  ${bg} hover:bg-white hover:shadow-sm hover:cursor-pointer focus:outline-none`}
                title={`${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`}
              >
                {/* 날짜: 좌상단 고정 */}
                <div className="text-[11px] font-medium absolute left-2 top-2">
                  {d.getDate()}
                </div>

                {/* 칩 영역: 2x2 그리드(값 있는 칸만 표시). DAILY 미노출 */}
                <div className="h-full w-full flex items-end">
                  {hasAny ? (
                    <div className="grid grid-cols-2 gap-1 w-full">
                      {/* DAY */}
                      {dayCnt > 0 ? (
                        <Chip tone="rose" count={dayCnt} />
                      ) : (
                        <span />
                      )}
                      {/* DUE */}
                      {dueCnt > 0 ? (
                        <Chip tone="amber" count={dueCnt} />
                      ) : (
                        <span />
                      )}
                      {/* SCHEDULE */}
                      {schCnt > 0 ? (
                        <Chip tone="indigo" count={schCnt} />
                      ) : (
                        <span />
                      )}
                      {/* 빈 칸 정렬용 */}
                      <span />
                    </div>
                  ) : (
                    <div className="w-full h-6" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/** 작은 색상 사각형 + 카운트 */
function Chip({
  tone,
  count,
}: {
  tone: "rose" | "amber" | "indigo";
  count: number;
}) {
  const toneMap = {
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  } as const;
  return (
    <div
      className={`h-6 rounded-md border text-[11px] px-2 flex items-center justify-center ${toneMap[tone]} select-none`}
    >
      {count}
    </div>
  );
}
