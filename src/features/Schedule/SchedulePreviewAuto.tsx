"use client";

import { useEffect, useMemo, useState } from "react";
import SchedulePreview, { type PreviewItem } from "./SchedulePreview";
import { supabase } from "@/shared/lib/supabase";

type Props = {
  maxCount?: number; // 기본 3
  className?: string;
  onItemClick?: (item: PreviewItem) => void;
  // 필요하면 사용자별 필터링용 칼럼들 추가 (예: user_id)
};

function ymd(d: Date) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ).toLocaleDateString("sv-SE"); // YYYY-MM-DD
}

export function SchedulePreviewAuto({ maxCount = 3 }: Props) {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const todayStr = useMemo(() => ymd(new Date()), []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      // 다가오는 일정(오늘 포함) 오름차순으로 최대 maxCount개
      const { data, error } = await supabase
        .from("schedule")
        .select("id,date,title")
        .gte("date", todayStr)
        .order("date", { ascending: true })
        .limit(maxCount);

      if (!ignore) {
        if (error) {
          console.error("[SchedulePreviewAuto] fetch error:", error.message);
          setItems([]);
        } else {
          setItems((data ?? []) as PreviewItem[]);
        }
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [todayStr, maxCount]);

  return (
    <SchedulePreview items={items} maxCount={maxCount} loading={loading} />
  );
}
export default SchedulePreviewAuto;
