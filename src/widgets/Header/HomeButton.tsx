// src/widgets/HomeButton.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HomeButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 메인페이지("/")에서는 렌더 X
  if (pathname === "/") return null;

  const goHome = () => navigate("/");

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={goHome}
      aria-label="메인페이지로"
      title="메인페이지로"
      className={`
        fixed bottom-4 left-4 md:bottom-2 md:left-2 z-[70]
        group cursor-pointer hover:cursor-pointer
        w-20 h-20 aspect-square p-0
        flex flex-col items-center justify-center gap-1
        rounded-2xl
        text-neutral-700 dark:text-neutral-200
        hover:bg-transparent active:bg-transparent
        transition-transform duration-300 ease-out
        hover:-translate-y-0.5 active:translate-y-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60
      `}
    >
      <Home
        strokeWidth={2.6}
        className="
          h-6 w-6
          text-neutral-700 dark:text-neutral-200
          transition-transform duration-300 ease-out
          group-hover:-translate-y-0.5 group-hover:rotate-[9deg] group-hover:scale-110
          group-active:rotate-0 group-active:scale-100
        "
        aria-hidden="true"
      />
      <span
        className="
          text-[11px] leading-none font-semibold tracking-tight
          text-neutral-700 dark:text-neutral-200
          transition-all duration-300 ease-out
          group-hover:translate-y-0.5 group-hover:tracking-wider
        "
      >
        메인페이지로
      </span>
    </Button>
  );
}
