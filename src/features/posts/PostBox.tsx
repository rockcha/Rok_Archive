// src/features/posts/PostBox.tsx
"use client";

import { cn } from "@/shared/lib/utils";
import { useNavigate } from "react-router-dom";
import CategoryIcon from "./CategoryIcon";
type PostBoxProps = {
  id?: string;
  slug?: string;
  title: string;
  category: string; // "react" 등
  href?: string;
  onClick?: (args: { id?: string; slug?: string; href?: string }) => void;
  className?: string;
};

export default function PostBox({
  id,
  slug,
  title,
  category,
  href,
  onClick,
  className,
}: PostBoxProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick({ id, slug, href });
    const to =
      href ?? (slug ? `/posts/${slug}` : id ? `/posts/id/${id}` : null);
    if (!to) return console.warn("PostBox: no navigation target");
    if (/^https?:\/\//i.test(to)) window.location.href = to;
    else navigate(to);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border",
        "bg-white/90 dark:bg-zinc-900/80 shadow-sm hover:shadow transition-all",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/60 p-3 text-left",
        className
      )}
      title={title}
    >
      <div className="flex h-full flex-col">
        {/* 제목 (2줄 고정) */}
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          {title}
        </h4>

        <div className="mt-auto" />

        {/* 카테고리 아이콘 칩 (중립 톤) */}
        <span
          className={cn(
            "inline-flex w-max items-center gap-1 rounded-full",
            "border border-zinc-200 dark:border-zinc-700",
            "px-2 py-0.5 text-xs font-medium",
            "text-zinc-700 dark:text-zinc-300",
            "transition-transform group-hover:-translate-y-0.5"
          )}
        >
          <CategoryIcon value={category} size={14} className="-mt-px" />
          <span className="uppercase">{category}</span>
        </span>
      </div>
    </button>
  );
}
