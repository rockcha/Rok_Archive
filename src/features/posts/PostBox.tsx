// src/features/posts/PostBox.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";

type Props = {
  id: string; // postId
  title: string;
  categoryName: string; // 조인해서 전달
  tags: string[]; // 배열로 전달
  onClick?: (postId: string) => void;
  className?: string;
};

export default function PostBox({
  id,
  title,
  categoryName,
  tags,
  onClick,
  className,
}: Props) {
  // shared/assets/<name>.png
  const iconSrc = useMemo(() => {
    if (!categoryName) return undefined;
    try {
      return new URL(`../../shared/assets/${categoryName}.png`, import.meta.url)
        .href;
    } catch {
      return undefined;
    }
  }, [categoryName]);

  const handleClick = () => onClick?.(id);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border",
        "bg-background dark:bg-zinc-900/80 shadow-sm hover:shadow transition-all",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 p-3 text-left",
        "flex h-full flex-col gap-3", // ✅ 세로 레이아웃 + 꽉 채우기
        "hover:cursor-pointer hover:bg-emerald-50"
      )}
      title={title}
      aria-label={`포스트: ${title}`}
    >
      {/* 1) 제목: 상단/가운데/조금 크게 */}
      <h4
        className={cn(
          "line-clamp-2 w-full text-center",
          "text-base sm:text-lg font-semibold leading-snug",
          "text-zinc-900 dark:text-zinc-100 tracking-tight"
        )}
      >
        {title}
      </h4>

      {/* 2) 태그: 제목 아래, 가운데 정렬 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className=" px-2 py-[2px] text-[12px] text-zinc-700 dark:text-zinc-300"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 빈 공간 채우기 후, 맨 아래 배지 */}
      <div className="mt-auto flex justify-center">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full",
            "bg-amber-50 border border-zinc-200 dark:border-zinc-700",
            "px-2 py-1 text-xs font-medium",
            "text-zinc-700 dark:text-zinc-300",
            "transition-transform group-hover:-translate-y-0.5"
          )}
        >
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={categoryName}
              className="h-[14px] w-[14px] object-contain"
              loading="lazy"
            />
          ) : null}
          <span className="uppercase">{categoryName}</span>
        </span>
      </div>
    </button>
  );
}
