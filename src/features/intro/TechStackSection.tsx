// src/features/intro/TechStackSection.tsx
"use client";

import { forwardRef, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { AnimatedBeam } from "@/shared/magicui/animated-beam";

/** 원형 아이콘 래퍼 (hover 시 살짝 확대) */
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-14 items-center justify-center rounded-full border-2 bg-background p-3",
        "shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:border-neutral-800",
        "transition-transform duration-200 ease-out hover:scale-105 will-change-transform",
        className
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = "Circle";

/** 스택 아이템: 원 + 하단 텍스트 */
function StackItem({
  circleRef,
  iconSrc,
  label,
}: {
  circleRef: React.Ref<HTMLDivElement>; // ✅ MutableRefObject, callback ref 모두 허용
  iconSrc: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Circle ref={circleRef}>
        <img src={iconSrc} alt={label} className="h-8 w-8 object-contain" />
      </Circle>
      <span className="text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
        {label}
      </span>
    </div>
  );
}

export default function TechStackSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 좌측 3
  const jsRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  // 중앙 허브
  const hubRef = useRef<HTMLDivElement>(null);

  // 우측 3
  const cppRef = useRef<HTMLDivElement>(null);
  const unrealRef = useRef<HTMLDivElement>(null);
  const dxRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col items-center gap-6 mt-4">
      {/* ↑ 프론트 공부하며 보유한 기술 */}
      <p className="text-center text-xl sm:text-xl text-neutral-600 dark:text-neutral-300">
        기본적인 서버 구현(REST·배포)과 다양한 웹 개발을 경험했고,
      </p>

      {/* ===== 기존 보유 스택(애니메이션) 영역: 로직 그대로 ===== */}
      <div
        ref={containerRef}
        className="
        relative flex w-full items-center justify-center overflow-hidden p-10
        h-[320px] sm:h-[360px] md:h-[420px]
      "
      >
        {/* 3행 레이아웃 */}
        <div className="flex size-full max-h-[280px] max-w-3xl flex-col items-stretch justify-between gap-10 md:max-h-[320px]">
          {/* 상단: 좌/우 */}
          <div className="flex flex-row items-center justify-between">
            <StackItem
              circleRef={jsRef}
              iconSrc="/JavaScript.png"
              label="JavaScript"
            />
            <StackItem circleRef={cppRef} iconSrc="/Cpp.png" label="C / C++" />
          </div>

          {/* 중단: 좌 / 허브 / 우 */}
          <div className="flex flex-row items-center justify-between">
            <StackItem
              circleRef={reactRef}
              iconSrc="/React.png"
              label="React"
            />

            {/* 중앙 허브 */}
            <div
              ref={hubRef}
              className="
              z-10 flex size-16 items-center justify-center rounded-full
              border-2 bg-background text-sm font-semibold shadow-md
              dark:border-neutral-800 sm:size-20 md:size-24 md:text-base
              transition-transform duration-200 ease-out hover:scale-105
            "
            >
              보유 스택
            </div>

            <StackItem
              circleRef={unrealRef}
              iconSrc="/Unreal.png"
              label="Unreal"
            />
          </div>

          {/* 하단: 좌/우 */}
          <div className="flex flex-row items-center justify-between">
            <StackItem
              circleRef={nextRef}
              iconSrc="/NextJS.jpg"
              label="Next.js"
            />
            <StackItem
              circleRef={dxRef}
              iconSrc="/DirectX.png"
              label="DirectX 11"
            />
          </div>
        </div>

        {/* Beams — 왼쪽 3 -> 허브 */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={jsRef}
          toRef={hubRef}
          curvature={-75}
          endYOffset={-10}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={reactRef}
          toRef={hubRef}
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={nextRef}
          toRef={hubRef}
          curvature={75}
          endYOffset={10}
        />

        {/* Beams — 오른쪽 3 -> 허브 (reverse) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={cppRef}
          toRef={hubRef}
          curvature={-75}
          endYOffset={-10}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={unrealRef}
          toRef={hubRef}
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={dxRef}
          toRef={hubRef}
          curvature={75}
          endYOffset={10}
          reverse
        />
      </div>
      {/* ===== 기존 보유 스택(애니메이션) 영역: 끝 ===== */}

      {/* ↓ 게임개발하며 보유한 기술 */}
      <p className="text-center text-xl sm:text-xl text-neutral-600 dark:text-neutral-300">
        게임 개발을 통해 C/C++·Unreal·DirectX 역량까지 갖췄습니다.
      </p>
    </div>
  );
}
