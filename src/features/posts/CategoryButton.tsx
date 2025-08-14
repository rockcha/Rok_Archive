// src/features/posts/CategoryButton.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCategoryCount } from "./hooks/useCategoryCount";
import { categoryLabel } from "./categories";

type Props = {
  value: string; // 카테고리 값(소문자 입력)
  selected?: boolean;
  onSelect?: (value: string) => void; // 클릭 시 부모에 알려줌
  className?: string;
};

export default function CategoryButton({
  value,
  selected,
  onSelect,
  className,
}: Props) {
  const { count, loading } = useCategoryCount(value);
  const label = categoryLabel(value);

  return (
    <Button
      type="button"
      aria-pressed={!!selected}
      onClick={() => onSelect?.(value)}
      variant={selected ? "default" : "outline"}
      className={cn(
        "w-full justify-between",
        selected
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800",
        className
      )}
      title={`${label} (${count})`}
    >
      <span>{label}</span>
      <span className="text-xs tabular-nums">
        {loading ? "…" : `(${count})`}
      </span>
    </Button>
  );
}
