// src/features/posts/components/CategoryIcon.tsx
"use client";

import { cn } from "@/shared/lib/utils";

type Props = {
  value: string; // "react" 같은 카테고리 (대소문자/공백 OK)
  size?: number; // px
  monochrome?: boolean; // 단색 아이콘으로 받기
  color?: string; // monochrome일 때 색 ("000000" 또는 "#000")
  className?: string;
  titleOverride?: string;
  /** 매핑에 없을 때 사용할 기본 아이콘 슬러그 */
  fallbackSlug?: string; // 기본: "mdnwebdocs"
};

// 카테고리 → SimpleIcons 슬러그 (필요 시 여기만 추가)
const ICON_SLUGS: Record<string, string> = {
  react: "react",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  "cs-basic": "mdnwebdocs",
};

function iconUrl(slug: string, color?: string) {
  const c = color?.trim().replace(/^#/, "");
  return c && c.length
    ? `https://cdn.simpleicons.org/${slug}/${c}`
    : `https://cdn.simpleicons.org/${slug}`;
}

export default function CategoryIcon({
  value,
  size = 16,
  monochrome = false,
  color,
  className,
  titleOverride,
  fallbackSlug = "mdnwebdocs",
}: Props) {
  const key = value.trim().toLowerCase();
  const slug = ICON_SLUGS[key] ?? fallbackSlug; // ✅ 항상 URL 사용 (폴백도 URL)

  const url = iconUrl(slug, monochrome ? color ?? "000000" : undefined);

  return (
    <img
      src={url}
      alt={titleOverride ?? key.toUpperCase()}
      width={size}
      height={size}
      loading="lazy"
      className={cn("inline-block align-middle", className)}
      title={titleOverride ?? key.toUpperCase()}
      referrerPolicy="no-referrer"
    />
  );
}
