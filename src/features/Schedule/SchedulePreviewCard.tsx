// src/features/schedule/SchedulePreviewCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Lock } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { useAdmin } from "../Auth/useAdmin"; // ✅ 추가

type Row = {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  content: string | null;
};

function ymd(d: Date) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).toLocaleDateString("sv-SE");
}

function diffLabel(targetYmd: string) {
  const today = new Date();
  const t = new Date(targetYmd);
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function SchedulePreviewCard({
  limitFetch = 50,
  viewportRows = 3,
}: {
  limitFetch?: number;
  viewportRows?: number;
}) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ 관리자 권한 체크
  const { isAdmin, hydrated, checkSession } = useAdmin();
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayStr = useMemo(() => ymd(new Date()), []);

  useEffect(() => {
    // 아직 세션 정보 준비 전이면 대기
    if (!hydrated) return;

    // 비관리자면 데이터 자체를 불러오지 않음(정보 노출 방지)
    if (!isAdmin) {
      setItems([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("schedule")
        .select("id,date,title,content")
        .gte("date", todayStr) // 오늘 이후만
        .order("date", { ascending: true })
        .limit(limitFetch);

      if (!error && data) setItems(data as Row[]);
      setLoading(false);
    })();
  }, [hydrated, isAdmin, todayStr, limitFetch]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-neutral-600" />
          일정 미리보기
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* ✅ 권한 안내 */}
        {!hydrated ? (
          <div className="text-sm text-neutral-500 py-2">불러오는 중…</div>
        ) : !isAdmin ? (
          <div className="text-sm text-neutral-500 py-6 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            관리자에게만 공개되는 내용입니다.
          </div>
        ) : loading ? (
          <ul className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <li
                key={i}
                className="h-9 rounded bg-neutral-100 animate-pulse"
              />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="text-sm text-neutral-500 py-2">
            다가오는 일정이 없어요.
          </div>
        ) : (
          <ul
            className={[
              "max-h-[calc(3*2.75rem)]",
              viewportRows !== 3 ? `max-h-[calc(${viewportRows}*2.75rem)]` : "",
              "overflow-y-auto pr-1 space-y-1",
            ].join(" ")}
          >
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-2 rounded border px-3 py-2"
                title={it.date}
              >
                <span className="flex-1 min-w-0 truncate text-sm">
                  {it.title}
                </span>
                <span className="shrink-0 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                  {diffLabel(it.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
