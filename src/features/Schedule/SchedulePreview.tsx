// src/features/schedule/SchedulePreview.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useAdmin } from "../Auth/useAdmin";

// ✨ 추가: ShineBorder + 테마
import { ShineBorder } from "@/shared/magicui/shine-border";
import { useTheme } from "next-themes";

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

  // 오늘 날짜 ref
  const todayRef = useRef(new Date());

  const upcoming = useMemo(() => {
    const today = todayRef.current;
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return items
      .filter((it) => toDateOnly(it.date) >= t0)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, maxCount);
  }, [items, maxCount]);

  // ✨ 모노톤(라이트=블랙계열, 다크=화이트계열)
  const { theme } = useTheme();
  const monoColors =
    theme === "dark"
      ? ["#ffffff", "#d1d5db", "#9ca3af"]
      : ["#000000", "#4b5563", "#9ca3af"];

  return (
    <div
      className={[
        "fixed top-28 sm:left-3 2xl:left-30 z-50 w-[18rem] max-w-none hidden md:block",
        className || "",
      ].join(" ")}
    >
      {/* ✨ ShineBorder 래퍼: z-order 세팅 */}
      <div className="relative overflow-hidden rounded-2xl">
        <ShineBorder
          className="z-20"
          shineColor={monoColors}
          borderWidth={2}
          duration={14}
        />

        <Card className="relative z-10 shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg mb-1">
                <span>🗓️</span> 일정 미리보기
              </CardTitle>
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
                <div className="text-sm text-muted-foreground">
                  불러오는 중…
                </div>
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
                        className="w-full text-left rounded-xl border-2 bg-background transition p-3 flex items-center gap-3"
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
      </div>
    </div>
  );
}
