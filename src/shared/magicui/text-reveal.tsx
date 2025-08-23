// src/shared/magicui/text-reveal.tsx
"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** 스크롤에 따라 단어가 하나씩 드러나는 컴포넌트 */
export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  /** 반드시 문자열 하나로 전달 (단어 단위로 나눠서 애니메이션) */
  children: string;
  /** 전체 높이 (기본 200vh) */
  heightClassName?: string;
  /** sticky 컨테이너 높이 (기본 50%) */
  stickyHeightClassName?: string;
}

export const TextReveal = ({
  children,
  className,
  heightClassName = "h-[200vh]",
  stickyHeightClassName = "h-[50%]",
  ...rest
}: TextRevealProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string");
  }

  const words = children.split(" ");

  return (
    <div
      ref={targetRef}
      className={cn("relative z-0", heightClassName, className)}
      {...rest}
    >
      {/* sticky 레이어 */}
      <div
        className={cn(
          "sticky top-0 mx-auto flex max-w-4xl items-center bg-transparent",
          "px-4 py-20",
          stickyHeightClassName
        )}
      >
        <span className="flex flex-wrap p-5 text-2xl font-bold text-black/20 dark:text-white/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                range={[start, end]}
              >
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-1.5">
      {/* 흐릿한 가이드 */}
      <span className="absolute opacity-30">{children}</span>
      {/* 실제로 드러나는 텍스트 */}
      <motion.span style={{ opacity }} className="text-black dark:text-white">
        {children}
      </motion.span>
    </span>
  );
};
