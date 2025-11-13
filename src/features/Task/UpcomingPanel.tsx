"use client";

import { useMemo, useState } from "react";
import type { Task, Schedule } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  dueTasks: Task[];
  schedules: Schedule[];
  onOpenTaskDetail?: (taskId: number) => void;
};

const tone = {
  DUE: {
    dot: "bg-amber-500",
    row: "border-amber-200 hover:bg-amber-50/60",
    label: "text-amber-700",
  },
  SCHEDULE: {
    dot: "bg-indigo-500",
    row: "border-indigo-200 hover:bg-indigo-50/60",
    label: "text-indigo-700",
  },
} as const;

type Tab = "TASK" | "SCHEDULE";

export default function UpcomingPanel({
  dueTasks,
  schedules,
  onOpenTaskDetail,
}: Props) {
  const [fold, setFold] = useState(false);
  const [tab, setTab] = useState<Tab>("TASK");

  const taskRows = useMemo(
    () =>
      dueTasks.map((t) => ({
        id: t.id,
        title: t.title || "(제목 없음)",
        right: t.date,
      })),
    [dueTasks]
  );
  const scheduleRows = useMemo(
    () =>
      schedules.map((s) => ({
        id: s.id,
        title: s.title || "(제목 없음)",
        right: s.date,
      })),
    [schedules]
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                tab === "TASK" ? tone.DUE.dot : tone.SCHEDULE.dot
              }`}
            />
            다가오는
          </CardTitle>

          {/* 접기/펼치기 */}
          <button
            className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
            onClick={() => setFold((v) => !v)}
          >
            {fold ? (
              <>
                펼치기 <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                접기 <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* 내부 슬라이드 탭 */}
        <div className="mt-3 relative bg-white border rounded-full p-1 flex items-center gap-1">
          <div className="relative w-[220px] grid grid-cols-2 text-sm">
            <div
              className="absolute top-0 bottom-0 w-1/2 rounded-full bg-primary/10 transition-transform"
              style={{
                transform:
                  tab === "TASK" ? "translateX(0%)" : "translateX(100%)",
              }}
            />
            <button
              className={`z-10 py-1 rounded-full ${
                tab === "TASK" ? "text-primary font-medium" : "text-neutral-600"
              }`}
              onClick={() => setTab("TASK")}
            >
              Task
            </button>
            <button
              className={`z-10 py-1 rounded-full ${
                tab === "SCHEDULE"
                  ? "text-primary font-medium"
                  : "text-neutral-600"
              }`}
              onClick={() => setTab("SCHEDULE")}
            >
              Schedule
            </button>
          </div>
        </div>
      </CardHeader>

      {!fold && (
        <CardContent>
          <ScrollArea className="h-[220px] pr-2">
            <div className="space-y-2">
              {tab === "TASK" ? (
                taskRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center">
                    다가오는 Task가 없습니다.
                  </div>
                ) : (
                  taskRows.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onOpenTaskDetail?.(r.id)}
                      className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-colors ${tone.DUE.row}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`h-2 w-2 rounded-full ${tone.DUE.dot}`}
                        />
                        <span className={`text-xs ${tone.DUE.label}`}>DUE</span>
                        <span className="truncate text-sm">{r.title}</span>
                      </div>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {r.right}
                      </span>
                    </button>
                  ))
                )
              ) : scheduleRows.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  예정된 일정이 없습니다.
                </div>
              ) : (
                scheduleRows.map((r) => (
                  <div
                    key={r.id}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${tone.SCHEDULE.row}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full ${tone.SCHEDULE.dot}`}
                      />
                      <span className={`text-xs ${tone.SCHEDULE.label}`}>
                        SCHEDULE
                      </span>
                      <span className="truncate text-sm">{r.title}</span>
                    </div>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {r.right}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
