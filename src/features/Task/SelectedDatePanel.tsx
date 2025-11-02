"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Task, Schedule } from "./types";
import { cn, weekdayKR } from "./utils";
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";

export default function SelectedDatePanel({
  date,
  daily,
  day,
  due,
  schedules,
  onClickTask,
}: {
  date: string; // YMD
  daily: Task[];
  day: Task[];
  due: Task[];
  schedules: Schedule[];
  onClickTask?: (t: Task) => void;
}) {
  const label = new Date(date + "T00:00:00");
  const title = `${label.getFullYear()}.${String(label.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(label.getDate()).padStart(2, "0")} (${weekdayKR(label)})`;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">📌 {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="DAILY" tone="emerald">
          {daily.length === 0 ? (
            <Empty text="등록된 DAILY가 없습니다." />
          ) : (
            <ul className="space-y-1">
              {daily.map((t) => (
                <li key={t.id}>
                  <Row
                    text={t.title}
                    muted={t.is_completed}
                    onClick={() => onClickTask?.(t)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="DAY" tone="rose">
          {day.length === 0 ? (
            <Empty text="해당 날짜의 DAY가 없습니다." />
          ) : (
            <ul className="space-y-1">
              {day.map((t) => (
                <li key={t.id}>
                  <Row
                    text={t.title}
                    muted={t.is_completed}
                    onClick={() => onClickTask?.(t)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="DUE" tone="amber">
          {due.length === 0 ? (
            <Empty text="해당 날짜의 DUE가 없습니다." />
          ) : (
            <ul className="space-y-1">
              {due.map((t) => (
                <li key={t.id}>
                  <Row text={t.title} onClick={() => onClickTask?.(t)} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Schedule" tone="indigo">
          {schedules.length === 0 ? (
            <Empty text="해당 날짜의 Schedule이 없습니다." />
          ) : (
            <ul className="space-y-1">
              {schedules.map((s) => (
                <li key={s.id}>
                  <div
                    className="flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 text-sm hover:bg-white transition"
                    title={s.title}
                  >
                    <CalendarIcon className="w-4 h-4 text-neutral-500" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.title}</div>
                      {s.content && (
                        <div className="text-xs text-neutral-500 line-clamp-2">
                          {s.content}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "emerald" | "rose" | "amber" | "indigo";
  children: React.ReactNode;
}) {
  const badge = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
  }[tone];

  return (
    <div>
      <div className="mb-2 text-xs">
        <span className={cn("px-2 py-[2px] rounded-full", badge)}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground">{text}</div>;
}

function Row({
  text,
  muted,
  onClick,
}: {
  text: string;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 rounded-lg border bg-white/80 px-3 py-2 text-sm",
        "hover:bg-white transition",
        muted && "opacity-80"
      )}
      title={text}
    >
      <CheckCircle className="w-4 h-4 text-neutral-500" />
      <span className="truncate">{text}</span>
    </button>
  );
}
