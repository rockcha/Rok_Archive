// src/features/posts/PostBox.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";
import { ShineBorder } from "@/shared/magicui/shine-border";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();

  // 아이콘 경로
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

  // ✨ 모노톤(라이트=검정계열, 다크=흰계열) — 살짝만
  const mono =
    theme === "dark"
      ? ["#ffffff", "#e5e7eb", "#9ca3af"]
      : ["#000000", "#4b5563", "#9ca3af"];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={`포스트: ${title}`}
      className={cn(
        // 카드 베이스
        "group relative overflow-hidden rounded-xl border",
        "bg-background dark:bg-zinc-900/80 shadow-sm hover:shadow transition-all",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/60",
        // 레이아웃
        "flex h-full flex-col p-3 gap-3",
        "hover:cursor-pointer hover:bg-emerald-50",
        className
      )}
    >
      {/* ✨ (바깥) 카드 자체에 아주 은은한 모노톤 ShineBorder */}
      <ShineBorder
        className="z-10"
        shineColor={mono}
        borderWidth={1} // 살짝만
        duration={16} // 느긋하게
      />

      {/* 1) 제목 */}
      <h4
        className={cn(
          "line-clamp-2 w-full text-center",
          "text-base sm:text-lg font-semibold leading-snug",
          "text-zinc-900 dark:text-zinc-100 tracking-tight"
        )}
      >
        {title}
      </h4>

      {/* 2) 아이콘 네모칸 + (안쪽) ShineBorder */}
      <div className="flex-1 grid place-items-center py-2">
        {iconSrc ? (
          <div
            className={cn(
              // 네모칸 컨테이너
              "relative isolate overflow-hidden rounded-2xl",
              // 기본 보더(효과가 안 먹었을 때 대비)
              "border-2 border-gray-300 bg-white dark:bg-zinc-900",
              "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
              "p-2 sm:p-3"
            )}
          >
            {/* ✨ 네모칸 내부 테두리만 살짝 */}
            <ShineBorder shineColor={mono} borderWidth={1} duration={12} />
            <img
              src={iconSrc}
              alt={categoryName}
              loading="lazy"
              className={cn(
                "relative z-10 h-4 w-4 sm:h-9 sm:w-9 object-contain",
                "transition-transform duration-200 group-hover:scale-[1.1]"
              )}
            />
          </div>
        ) : null}
      </div>

      {/* 3) 하단 배지/텍스트 없음 */}
    </button>
  );
}
