// src/widgets/MainButton.tsx
"use client";

import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

type MainButtonProps = {
  /** 버튼 라벨 (툴팁/스크린리더용) */
  label?: string;
  /** 겹침 우선순위 조절 */
  zIndexClassName?: string;
};

export default function MainButton({
  label = "메인으로",
  zIndexClassName = "z-50",
}: MainButtonProps) {
  const { pathname } = useLocation();

  // 경로 정규화(뒤 슬래시 제거)
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  // /main 에서는 숨김
  if (normalizedPath === "/main") return null;

  return (
    <div
      className={[
        "fixed left-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]",
        "md:left-6 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom))]",
        zIndexClassName,
      ].join(" ")}
    >
      <Link
        to="/main"
        aria-label={label}
        className="group block focus:outline-none"
      >
        {/* 네모 박스 */}
        <div
          className={[
            "w-14 h-14 md:w-16 md:h-16",
            "rounded-2xl",
            // 글래스 + 라인 + 그림자
            "bg-white/70 dark:bg-white/10 backdrop-blur-xl",
            "shadow-lg ring-1 ring-black/5",
            "relative overflow-hidden",
            // hover/active 애니메이션
            "transition-all duration-200 ease-out",
            "hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
          ].join(" ")}
        >
          {/* 테두리 그라데이션 라인 */}
          <span className="pointer-events-none absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/30 via-white/10 to-transparent" />

          {/* 코너 라이트 */}
          <span className="pointer-events-none absolute -top-6 -left-6 h-16 w-16 rounded-full bg-white/30 blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* 아이콘 */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <Home
              className="h-6 w-6 md:h-7 md:w-7 text-neutral-800/90 dark:text-white/90 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
