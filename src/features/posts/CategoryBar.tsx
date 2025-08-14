// src/features/posts/CategoryBar.tsx
"use client";

import { useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton";
import { CATEGORIES } from "./categories";

import { Button } from "@/shared/ui/button";
import { prefetchCategoryCounts } from "./hooks/useCategoryCount";

type Props = {
  selected: string | null; // 현재 선택 (none = null)
  onSelect: (value: string | null) => void; // 부모로 알림
  categories?: readonly string[]; // 기본: CATEGORIES
  className?: string;
  showNone?: boolean; // '전체/None' 버튼
  noneLabel?: string; // 기본: "All"
};

export default function CategoryBar({
  selected,
  onSelect,
  categories = CATEGORIES,
  className,
  showNone = true,
  noneLabel = "All",
}: Props) {
  // 최초 로드시 모든 카테고리 카운트 프리패치(작으면 이게 더 부드러움)
  useEffect(() => {
    void prefetchCategoryCounts(categories as string[]);
  }, [categories]);

  return (
    <nav className={cn("flex flex-col gap-2", className)} aria-label="카테고리">
      {showNone && (
        <Button
          type="button"
          aria-pressed={selected === null}
          onClick={() => onSelect(null)}
          variant={selected === null ? "default" : "outline"}
          className={cn(
            "w-full justify-between",
            selected === null
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title={noneLabel}
        >
          <span>{noneLabel}</span>
          <span className="text-xs opacity-70">—</span>
        </Button>
      )}

      {(categories as string[]).map((cat) => (
        <CategoryButton
          key={cat}
          value={cat}
          selected={selected === cat}
          onSelect={(v) => onSelect(v)}
        />
      ))}
    </nav>
  );
}
