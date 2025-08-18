"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

export type PreviewItem = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
};

type Props = {
  items: PreviewItem[]; // 전체 일정 (과거 포함 가능)
  maxCount?: number; // 표시 개수 (기본 3)
  className?: string;
  loading?: boolean;
  onItemClick?: (item: PreviewItem) => void; // 클릭시 상세 열기 등
};

function toDateOnly(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(from: Date, to: Date) {
  const start = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  ).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((end - start) / 86_400_000); // ✅ ms 차이 → 일수
}

function dLabel(today: Date, dateStr: string) {
  const d = toDateOnly(dateStr);
  const delta = diffDays(today, d);
  if (delta === 0) return "D-Day";
  if (delta > 0) return `D-${delta}`;
  return `D+${Math.abs(delta)}`; // 참고: 과거일 경우
}

export default function SchedulePreview({
  items,
  maxCount = 3,
  loading,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const today = useMemo(() => new Date(), []);

  // 다가오는 일정만 추려 표시 (오늘 포함)
  const upcoming = useMemo(() => {
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return items
      .filter((it) => toDateOnly(it.date) >= t0)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, maxCount);
  }, [items, maxCount, today]);

  return (
    <Card className="fixed top-30 left-3 z-50 w-[82vw] max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>🗓️</span> 일정 미리보기
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            다가오는 일정을 확인해보세요
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "펼치기" : "접기"}
        </Button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">불러오는 중…</div>
          ) : upcoming.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              예정된 일정이 없어요.
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="w-full text-left rounded-xl border bg-background/60
                              
                               transition p-3 flex items-center gap-3"
                  >
                    <Badge variant="secondary" className="shrink-0">
                      {dLabel(today, it.date)}
                    </Badge>
                    <div className="flex-1 truncate">{it.title}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
