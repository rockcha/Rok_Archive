// src/features/schedule/SchedulePreview.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAdmin } from "../Auth/useAdmin";

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
  onItemClick?: (item: PreviewItem) => void; // 클릭 시 상세 열기 등
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
  return Math.round((end - start) / 86_400_000); // ms → days
}

function dLabel(today: Date, dateStr: string) {
  const d = toDateOnly(dateStr);
  const delta = diffDays(today, d);
  if (delta === 0) return "D-Day";
  if (delta > 0) return `D-${delta}`;
  return `D+${Math.abs(delta)}`; // 과거
}

export default function SchedulePreview({
  items,
  maxCount = 3,
  className,
  loading,
  onItemClick,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  // 권한 제어
  const { isAdmin, hydrated, checkSession } = useAdmin();
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hook들은 항상 최상단에서 호출되도록 유지
  // 오늘 날짜는 고정 참조로 보관해 의존성에서 제외
  const todayRef = useRef(new Date());

  const upcoming = useMemo(() => {
    const today = todayRef.current;
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return items
      .filter((it) => toDateOnly(it.date) >= t0)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, maxCount);
  }, [items, maxCount]);

  return (
    <Card
      className={[
        "fixed top-28 left-50 z-50 w-[18rem] max-w-none hidden md:block",
        className || "",
      ].join(" ")}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg mb-1">
            <span>🗓️</span> 일정 미리보기
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-2">
            일정을 확인해보세요
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((v) => !v)}
          className="hover:cursor-pointer"
        >
          {collapsed ? "펼치기" : "접기"}
        </Button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-2">
          {!hydrated ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              불러오는 중…
            </div>
          ) : !isAdmin ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              관리자에게만 공개되는 내용입니다.
            </div>
          ) : loading ? (
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
                    onClick={() => onItemClick?.(it)}
                    className="w-full text-left rounded-xl border bg-background/60 transition p-3 flex items-center gap-3"
                  >
                    <Badge variant="secondary" className="shrink-0">
                      {dLabel(todayRef.current, it.date)}
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
