// src/features/intro/SectionShell.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useCallback } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** 푸터 CTA 텍스트 (예: "기술 스택") */
  ctaLabel?: string;
  /** 이동할 앵커(예: "#tech-stack") */
  ctaHref?: string;
  /** 추가로 더 내릴 양 (양수; "px" 또는 "vh" 지원). ex) "15vh" */
  ctaOffset?: number | `${number}px` | `${number}vh`;
};

export default function SectionShell({
  children,
  className,
  ctaLabel,
  ctaHref,
  ctaOffset = "15vh", // 👉 기본 15vh 더 내려줌
}: Props) {
  const toPx = (v: Props["ctaOffset"]) => {
    if (typeof v === "number") return v;
    if (!v) return 0;
    if (v.endsWith("vh")) return (parseFloat(v) / 100) * window.innerHeight;
    if (v.endsWith("px")) return parseFloat(v);
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ctaHref) return;
      e.preventDefault();
      const el = document.querySelector(ctaHref) as HTMLElement | null;
      if (!el) return;
      const baseY = el.getBoundingClientRect().top + window.scrollY;
      const extra = toPx(ctaOffset) - 70; // 👉 추가로 더 내려갈 거리
      window.scrollTo({ top: baseY + extra, behavior: "smooth" });
    },
    [ctaHref, ctaOffset]
  );

  return (
    <section
      className={cn(
        // 한 화면 꽉 채우고, 상하로 가운데 + 하단 CTA
        "min-h-[100svh] px-6 py-8 flex flex-col",
        className
      )}
    >
      <div className="flex-1 w-full flex items-center justify-center">
        {children}
      </div>

      {ctaHref && ctaLabel && (
        <footer className="mt-6 flex items-center justify-center">
          <a
            href={ctaHref}
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium
                       text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800
                       transition"
          >
            <span className="text-lg">↓</span>
            내려서 {ctaLabel} 보기
          </a>
        </footer>
      )}
    </section>
  );
}
