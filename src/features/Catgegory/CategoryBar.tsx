// src/features/posts/CategoryBar.tsx
"use client";

import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton";
import { useCategories } from "./useCategories";

type Props = {
  selected: number | null;
  onSelect: (value: number | null) => void;
  className?: string;

  showAllActive?: boolean;
  onToggleShowAll?: (v: boolean) => void;
  showAllLabel?: string;
};

export default function CategoryBar({
  selected,
  onSelect,
  className,
  showAllActive = false,
  onToggleShowAll,
  showAllLabel = "전체보기",
}: Props) {
  const { data: categories, loading } = useCategories();

  return (
    <nav
      className={cn(
        "relative rounded-lg p-2 mt-2 flex flex-col gap-2",
        // ✅ 높이 제한 + 세로 스크롤
        "max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400",
        className
      )}
      aria-label="카테고리"
    >
      <div className="flex flex-col gap-1">
        <CategoryButton
          id={null}
          label={showAllLabel}
          selected={!!showAllActive}
          isAll
          onSelectAll={() => onToggleShowAll?.(true)}
          onSelect={() => {}}
          className="shadow-md"
        />

        {loading ? (
          <div className="px-1 py-2 text-sm text-zinc-500">
            카테고리 불러오는 중…
          </div>
        ) : categories.length ? (
          categories.map((cat) => (
            <CategoryButton
              key={String(cat.id)}
              id={cat.id}
              label={cat.name}
              selected={selected === cat.id && !showAllActive}
              onSelect={(id) => {
                onToggleShowAll?.(false);
                onSelect(id as number);
              }}
              className="shadow-md"
            />
          ))
        ) : (
          <div className="px-1 py-2 text-sm text-emerald-500">
            카테고리가 없습니다.
          </div>
        )}
      </div>
    </nav>
  );
}
