// src/features/Catgegory/CategoryButton.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { supabase } from "@/shared/lib/supabase";

type Props = {
  id: number | null;
  label: string;
  selected: boolean;
  onSelect: (id: number | null) => void;
  className?: string;

  // ✅ 추가
  isAll?: boolean;
  onSelectAll?: () => void;
};

export default function CategoryButton({
  id,
  label,
  selected,
  onSelect,
  className,
  isAll = false,
  onSelectAll,
}: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      // ✅ 전체보기면 카테고리 조건 없이 전체 발행글 수
      const base = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .not("published_at", "is", null);

      const { count: c, error } = isAll
        ? await base
        : await base.eq("category_id", id);

      if (!alive) return;
      if (error) {
        console.error(error.message);
        setCount(0);
      } else {
        setCount(c ?? 0);
      }
    })();
    return () => {
      alive = false;
    };
    // isAll/id가 바뀌면 재조회
  }, [isAll, id]);

  const handleClick = () => {
    if (isAll) {
      onSelectAll?.();
    } else {
      onSelect(id);
    }
  };

  return (
    <Button
      type="button"
      aria-pressed={selected}
      onClick={handleClick}
      variant={selected ? "default" : "outline"}
      className={cn(
        "w-full justify-between",
        selected
          ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:cursor-pointer"
          : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:cursor-pointer",
        className
      )}
      title={label}
    >
      <span>{label}</span>
      <span className="text-xs opacity-70">({count ?? "…"})</span>
    </Button>
  );
}
