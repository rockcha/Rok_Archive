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
  // local->sv-SE로 안전하게 YYYY-MM-DD
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
  const [active, setActive] = useState<Schedule | null>(null); // 상세보기 대상

  const range = useMemo(() => {
    const start = firstOfMonth(cursor);
    const end = lastOfMonth(cursor);
    return { start, end, startStr: ymd(start), endStr: ymd(end) };
  }, [cursor]);

  // 월 범위 데이터 로드
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
    // 같은 달 범위일 경우에만 즉시 반영
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
    <div className="w-full flex justify-center py-6">
      <Card className="w-[80%] max-w-[1200px]">
        <CardHeader className="grid grid-cols-3 items-center">
          {/* 왼쪽: 이전 달 */}
          <div className="justify-self-start">
            <Button
              variant="outline"
              onClick={goPrev}
              className="hover:cursor-pointer"
            >
              이전 달
            </Button>
          </div>

          {/* 가운데: 월 표기 */}
          <CardTitle className="justify-self-center text-xl">
            {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
          </CardTitle>

          {/* 오른쪽: 다음 달 + 새 일정 */}
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
        <CardContent>
          {/* 높이는 고정하지 않고, 칸을 정사각형(aspect-square)로 맞춰 전체 높이가 자연히 결정되게 */}
          <CalendarGrid
            monthDate={cursor}
            schedules={items}
            onOpenDetail={(sch) => setActive(sch)}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* 새 일정 */}
      <NewScheduleDialog
        open={openNew}
        onOpenChange={setOpenNew}
        defaultDate={ymd(new Date())}
        onCreate={handleCreate}
      />

      {/* 상세보기 / 수정 / 삭제 */}
      <ScheduleDialog
        schedule={active}
        onClose={() => setActive(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
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
