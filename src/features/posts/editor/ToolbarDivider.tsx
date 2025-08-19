// src/features/posts/editor/ToolbarDivider.tsx
"use client";

export default function ToolbarDivider({
  tall = false, // true면 조금 더 길게
  subtle = false, // 은은한 톤
}: {
  tall?: boolean;
  subtle?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={[
        "shrink-0 mx-2", // 좌우 여백
        tall ? "h-7" : "h-6", // 높이
        "w-[1px]", // 1px hairline
        subtle ? "bg-muted-foreground/30" : "bg-border", // 색상
        "rounded-full", // 약간 부드럽게
      ].join(" ")}
    />
  );
}
