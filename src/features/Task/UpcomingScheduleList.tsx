"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { fetchUpcomingSchedules } from "./api";
import type { Schedule } from "./types";

export default function UpcomingScheduleList() {
  const [items, setItems] = useState<Schedule[]>([]);
  useEffect(() => {
    (async () => {
      const list = await fetchUpcomingSchedules(30);
      setItems(list);
    })();
  }, []);

  return (
    <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">다가오는 Schedule (30일)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">
            예정된 일정이 없습니다.
          </div>
        )}
        {items.map((s) => (
          <div key={s.id} className="rounded-lg border bg-white/80 p-3">
            <div className="text-xs text-muted-foreground">
              {new Date(s.date + "T00:00:00").toLocaleDateString()}
            </div>
            <div className="font-medium">{s.title}</div>
            {s.content && (
              <div className="text-sm text-neutral-600 line-clamp-2">
                {s.content}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
