// src/components/layout/Footer.tsx
"use client";

import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import AdminDock from "../AdminDock";
import { ShineBorder } from "@/shared/magicui/shine-border";

type Props = {
  className?: string;
};

function Footer({ className }: Props) {
  // 그린 계열 은은한 그라데이션 색
  const greenShine = ["#22c55e", "#86efac", "#34d399", "#16a34a"]; // 500/200/400/600 근처

  return (
    <footer
      role="contentinfo"
      className={cn(
        // 헤더와 동일한 폭/배경/여백 스펙
        "w-full mx-auto min-w-[42rem] bg-green-100",
        "border-t-2 border-gray-200 px-8",
        // 레이아웃
        "h-28 flex items-center justify-center",
        "z-40", // 필요시 조절
        className
      )}
    >
      {/* 바깥 래퍼: ShineBorder를 굵게, 패딩으로 돋보이게 */}
      <div className="relative overflow-hidden rounded-2xl p-2 md:p-3">
        <ShineBorder
          shineColor={greenShine}
          borderWidth={6} // ⬅️ 두껍게
          duration={16} // ⬅️ 적당히 느긋하게
          className="z-10" // ⬅️ 테두리 레이어
        />

        {/* 실제 내용: AdminDock을 가운데 크게 */}
        <div className="relative z-20 rounded-xl">
          {/* AdminDock은 내부 크기가 고정이라, 래퍼 scale로 확대 */}
          <div className="scale-105 sm:scale-110 md:scale-125 lg:scale-135 origin-center">
            <AdminDock />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
