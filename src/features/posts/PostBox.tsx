// src/features/posts/PostBox.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";

type Props = {
  id: string;
  title: string;
  categoryName: string;
  tags: string[];
  onClick?: (postId: string) => void;
  className?: string;
};

export default function PostBox({
  id,
  title,
  categoryName,

  onClick,
  className,
}: Props) {
  /** 카테고리별 아이콘 경로 생성 */
  const iconSrc = useMemo(() => {
    if (!categoryName) return undefined;
    try {
      return new URL(`../../shared/assets/${categoryName}.png`, import.meta.url)
        .href;
    } catch {
      return undefined;
    }
  }, [categoryName]);

  /** 버튼 클릭 이벤트 */
  const handleClick = () => onClick?.(id);

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={`포스트: ${title}`}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-background dark:bg-zinc-900/80 shadow-sm transition-all",
        "flex h-full flex-col p-3 gap-3 shadow-md",
        "hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:cursor-pointer",
        "min-h-[160px] ",
        className
      )}
    >
      {/* ── 1) 제목 ─────────────────────────────── */}
      <h4
        className={cn(
          "line-clamp-2 w-full text-center",
          "text-base sm:text-lg font-semibold leading-snug",
          "text-zinc-900 dark:text-zinc-100 tracking-tight pt-4"
        )}
      >
        {title}
      </h4>

      {/* ── 2) 아이콘 + 카테고리명 (카드 높이 유지 + 하단 우측) ───────── */}
      {(iconSrc || categoryName) && (
        <div className="mt-auto flex justify-end">
          <div
            className={cn(
              "rounded-lg  border-neutral-100 bg-white flex items-center gap-1",
              "px-2 py-1 shadow-md",
              "transition-transform duration-200 group-hover:scale-[1.08]"
            )}
          >
            {/* 아이콘 */}
            {iconSrc && (
              <img
                src={iconSrc}
                alt={categoryName}
                loading="lazy"
                className="h-4 w-4 object-contain"
              />
            )}

            {/* 카테고리 이름 */}
            {categoryName && (
              <span className="text-xs font-medium text-zinc-700">
                {categoryName}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
