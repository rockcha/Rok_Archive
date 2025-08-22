// src/app/scheduler/page.tsx (혹은 기존 경로 유지)
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CalendarGrid } from "@/features/Schedule/CalendarGrid";
import { NewScheduleDialog } from "@/features/Schedule/NewScheduleDialog";
import { ScheduleDialog } from "@/features/Schedule/ScheduleDialog";
import { CalendarPlus } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";

export type Schedule = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  content: string;
};

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

export default function SchedulerPage() {
  const [cursor, setCursor] = useState<Date>(() => firstOfMonth(new Date()));
  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  const [openNew, setOpenNew] = useState(false);
  const [active, setActive] = useState<Schedule | null>(null);

  const range = useMemo(() => {
    const start = firstOfMonth(cursor);
    const end = lastOfMonth(cursor);
    return { start, end, startStr: ymd(start), endStr: ymd(end) };
  }, [cursor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("schedule")
        .select("id,date,title,content")
        .gte("date", range.startStr)
        .lte("date", range.endStr)
        .order("date", { ascending: true });
      if (!error && data) setItems(data as Schedule[]);
      setLoading(false);
    })();
  }, [range.startStr, range.endStr]);

  const handleCreate = async (payload: Omit<Schedule, "id">) => {
    const { data, error } = await supabase
      .from("schedule")
      .insert(payload)
      .select("id,date,title,content")
      .single();
    if (error) throw error;

    const d = new Date(payload.date);
    if (d >= range.start && d <= range.end) {
      setItems((prev) => [...prev, data as Schedule]);
    }
    setOpenNew(false);
  };

  const handleUpdate = async (
    id: string,
    patch: Partial<Omit<Schedule, "id">>
  ) => {
    const { data, error } = await supabase
      .from("schedule")
      .update(patch)
      .eq("id", id)
      .select("id,date,title,content")
      .single();
    if (error) throw error;
    setItems((prev) => prev.map((x) => (x.id === id ? (data as Schedule) : x)));
    setActive(data as Schedule);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("schedule").delete().eq("id", id);
    if (error) throw error;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setActive(null);
  };

  const goPrev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  return (
    <div className="relative mb-4">
      <h1 className="text-2xl font-bold text-center">스케줄러</h1>
      {/* ── 본문: 카드 내부 스크롤 / 가운데 정렬 ── */}
      <div className="w-full flex justify-center py-2">
        <Card className="relative overflow-hidden rounded-2xl w-[80%] max-w-[1200px] h-[80vh] flex flex-col">
          {/* 헤더 (고정) */}
          <CardHeader className="grid grid-cols-3 items-center flex-none">
            <div className="justify-self-start">
              <Button
                variant="outline"
                onClick={goPrev}
                className="hover:cursor-pointer"
              >
                이전 달
              </Button>
            </div>

            <CardTitle className="justify-self-center text-xl">
              {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
            </CardTitle>

            <div className="justify-self-end flex gap-2">
              <Button
                variant="outline"
                onClick={goNext}
                className="hover:cursor-pointer"
              >
                다음 달
              </Button>
            </div>
          </CardHeader>

          {/* 본문 (스크롤) */}
          <CardContent className="flex-1 overflow-y-auto">
            <CalendarGrid
              monthDate={cursor}
              schedules={items}
              onOpenDetail={(sch) => setActive(sch)}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <NewScheduleDialog
        open={openNew}
        onOpenChange={setOpenNew}
        defaultDate={ymd(new Date())}
        onCreate={handleCreate}
      />

      <ScheduleDialog
        schedule={active}
        onClose={() => setActive(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* 플로팅 추가 버튼 */}
      <button
        onClick={() => setOpenNew(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
             bg-primary text-primary-foreground shadow-lg
             flex items-center justify-center
             transition-transform hover:scale-105
             hover:cursor-pointer"
        aria-label="새 일정 추가"
      >
        <CalendarPlus className="w-6 h-6" />
      </button>
    </div>
  );
}
