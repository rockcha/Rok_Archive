// src/features/Catgegory/CategoryButton.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

  // ✅ 아이콘 경로 (shared/assets/{카테고리이름}.png)
  const iconSrc = useMemo(() => {
    if (!label || isAll) return undefined;
    try {
      return new URL(`../../shared/assets/${label}.png`, import.meta.url).href;
    } catch {
      return undefined;
    }
  }, [label, isAll]);

  useEffect(() => {
    let alive = true;
    (async () => {
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
  }, [isAll, id]);

  const handleClick = () => {
    if (isAll) onSelectAll?.();
    else onSelect(id);
  };

  return (
    <Button
      type="button"
      aria-pressed={selected}
      onClick={handleClick}
      variant={selected ? "default" : "outline"}
      className={cn(
        "w-full h-16 min-h-16 py-3 px-3",
        "justify-between items-center gap-3",
        selected
          ? "bg-neutral-500 text-white hover:bg-neutral-700 hover:cursor-pointer"
          : "dark:bg-zinc-900  dark:hover:bg-zinc-800 hover:cursor-pointer",
        className
      )}
      title={label}
    >
      {/* LEFT: 아이콘 + 라벨 */}
      <span className="flex items-center gap-3 min-w-0">
        {/* 아이콘 (있을 때만) */}
        {iconSrc ? (
          <div className="w-9 h-9 rounded-md bg-background flex items-center justify-center ">
            <img
              src={iconSrc}
              alt={label}
              loading="lazy"
              className="w-6 h-6 object-contain"
            />
          </div>
        ) : null}

        {/* 라벨 */}
        <span className="font-semibold text-base truncate">{label}</span>
      </span>

      {/* RIGHT: 게시물 수 */}
      <span className="text-xs opacity-70 shrink-0">({count ?? "…"})</span>
    </Button>
  );
}
