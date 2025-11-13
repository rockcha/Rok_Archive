"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import type { Task, Schedule } from "./types";
import { Check, CalendarDays } from "lucide-react";

type Props = {
  daily: Task[];
  dayTasks: Task[];
  dueToday: Task[]; // 오늘(DUE)
  upcomingDue: Task[]; // 오늘 이후 DUE들
  upcomingSchedules: Schedule[];

  selectedId: number | null;
  onSelect: (taskId: number) => void; // 오늘/업커밍 Task 상세 열기
  onToggle: (taskId: number, next: boolean) => void; // 오늘 목록만 토글
  onOpenSchedule?: (scheduleId: string) => void;
};

type Tone = {
  base: string;
  hover: string;
  selected: string;
  border: string;
  title: string;
};
const tones: Record<"DAILY" | "DAY" | "DUE", Tone> = {
  DAILY: {
    base: "bg-emerald-50",
    hover: "hover:bg-emerald-100",
    selected: "data-[sel=true]:bg-emerald-100",
    border: "border-emerald-200",
    title: "text-emerald-900",
  },
  DAY: {
    base: "bg-rose-50",
    hover: "hover:bg-rose-100",
    selected: "data-[sel=true]:bg-rose-100",
    border: "border-rose-200",
    title: "text-rose-900",
  },
  DUE: {
    base: "bg-amber-50",
    hover: "hover:bg-amber-100",
    selected: "data-[sel=true]:bg-amber-100",
    border: "border-amber-200",
    title: "text-amber-900",
  },
};

type WithTone = Task & { _tone: Tone };
type Tab = "ALL" | "TASK" | "SCHEDULE";

export default function TodayListAside({
  daily,
  dayTasks,
  dueToday,
  upcomingDue,
  upcomingSchedules,
  selectedId,
  onSelect,
  onToggle,
  onOpenSchedule,
}: Props) {
  const [tab, setTab] = useState<Tab>("ALL");

  const todayRows: WithTone[] = useMemo(
    () => [
      ...daily.map((t) => ({ ...t, _tone: tones.DAILY })),
      ...dayTasks.map((t) => ({ ...t, _tone: tones.DAY })),
      ...dueToday.map((t) => ({ ...t, _tone: tones.DUE })),
    ],
    [daily, dayTasks, dueToday]
  );

  return (
    <Card className="rounded-2xl h-[720px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* 탭: 전체보기 / Task / Schedule */}
          <div className="relative bg-white border rounded-full p-1">
            <div className="relative w-[300px] grid grid-cols-3 text-sm">
              {["ALL", "TASK", "SCHEDULE"].map((k) => (
                <button
                  key={k}
                  className={`py-1 rounded-full transition-colors ${
                    tab === (k as Tab)
                      ? "text-primary font-medium"
                      : "text-neutral-600"
                  }`}
                  onClick={() => setTab(k as Tab)}
                >
                  {k === "ALL"
                    ? "전체보기"
                    : k === "TASK"
                    ? "Task"
                    : "Schedule"}
                </button>
              ))}
              <div
                className="absolute top-0 bottom-0 w-1/3 rounded-full bg-primary/10 transition-transform"
                style={{
                  transform:
                    tab === "ALL"
                      ? "translateX(0%)"
                      : tab === "TASK"
                      ? "translateX(100%)"
                      : "translateX(200%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* 상단 유형 Legend */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <LegendDot color="bg-emerald-500" label="DAILY" />
          <LegendDot color="bg-rose-500" label="DAY" />
          <LegendDot color="bg-amber-500" label="DUE" />
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 overflow-y-auto pr-1 h-[660px]">
          {/* 전체보기: 오늘 항목 (체크 가능) */}
          {tab === "ALL" &&
            (todayRows.length === 0 ? (
              <Empty text="오늘 할 일이 없습니다." />
            ) : (
              todayRows.map((t) => {
                const checked = t.is_completed;
                const sel = selectedId === t.id;
                return (
                  <div
                    key={t.id}
                    data-sel={sel || undefined}
                    className={[
                      "group w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors",
                      t._tone.base,
                      t._tone.border,
                      t._tone.hover,
                      t._tone.selected,
                      "cursor-pointer",
                    ].join(" ")}
                    onClick={() => onSelect(t.id)}
                    role="button"
                  >
                    {/* 체크 버튼 (stopPropagation으로 행 클릭과 구분) */}
                    <button
                      aria-label={checked ? "완료 취소" : "완료"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(t.id, !checked);
                      }}
                      className={[
                        "flex-shrink-0 h-[18px] w-[18px] rounded-full border flex items-center justify-center transition-all",
                        checked
                          ? "bg-primary border-primary text-white scale-95"
                          : "bg-white border-neutral-300",
                        "group-hover:scale-95",
                      ].join(" ")}
                    >
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </button>

                    <div
                      className={`flex-1 truncate text-sm ${
                        checked
                          ? "line-through text-neutral-400"
                          : t._tone.title
                      }`}
                      title={t.title || "(제목 없음)"}
                    >
                      {t.title || "(제목 없음)"}
                    </div>
                  </div>
                );
              })
            ))}

          {/* Task: 오늘 이후 DUE (체크 없음) + D-n 표기 */}
          {tab === "TASK" &&
            (upcomingDue.length === 0 ? (
              <Empty text="표시할 Task가 없습니다." />
            ) : (
              upcomingDue.map((t) => {
                const dn = formatDday(t.date); // D-n
                return (
                  <div
                    key={t.id}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors",
                      tones.DUE.base,
                      tones.DUE.border,
                      tones.DUE.hover,
                      "cursor-pointer",
                    ].join(" ")}
                    onClick={() => onSelect(t.id)}
                    role="button"
                    title={t.title || "(제목 없음)"}
                  >
                    <div className="shrink-0 text-[11px] rounded-md bg-white/70 border border-amber-200 px-2 py-0.5 text-amber-800">
                      {dn}
                    </div>
                    <div className="min-w-0 flex-1 truncate text-sm text-amber-900">
                      {t.title || "(제목 없음)"}
                    </div>
                  </div>
                );
              })
            ))}

          {/* Schedule: 체크 없음 */}
          {tab === "SCHEDULE" &&
            (upcomingSchedules.length === 0 ? (
              <Empty text="표시할 일정이 없습니다." />
            ) : (
              upcomingSchedules.map((s) => (
                <div
                  key={s.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors bg-indigo-50 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                  onClick={() => onOpenSchedule?.(s.id)}
                  role="button"
                  title={s.title || "(제목 없음)"}
                >
                  <div className="shrink-0 rounded-md bg-white/70 border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-800 inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {s.date}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-indigo-900">
                      {s.title || "(제목 없음)"}
                    </div>
                    {s.content && (
                      <div className="text-[12px] text-indigo-800/70 line-clamp-1">
                        {s.content}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-[11px] text-neutral-600">{label}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-sm text-muted-foreground py-8 text-center">{text}</div>
  );
}

/** D-day 계산 (오늘 기준) */
function formatDday(ymd?: string | null): string {
  if (!ymd) return "D-?";
  const today = new Date();
  const d = new Date(ymd + "T00:00:00");
  // 00:00 기준 비교를 위해 시간 제거
  const t0 = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();
  const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((d0 - t0) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-0";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
