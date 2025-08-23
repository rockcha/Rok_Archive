// src/features/intro/HeroSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { PixelImage } from "@/shared/magicui/pixel-image";
import { ShimmerButton } from "@/shared/magicui/shimmer-button"; // ✅ 추가

function TypingText({ ...props }) {
  // (TypingText는 그대로)
  const {
    text,
    target,
    speed = 80,
    holdMs = 4000,
    className = "",
    baseClassName = "",
    highlightClassName = "",
    caretWidthEm = 0.12,
    caretHeightEm = 1.1,
    caretClassName = "caret-blink",
  } = props;

  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  const [start, end] = useMemo(() => {
    const s = text.indexOf(target);
    return s >= 0 ? [s, s + target.length] : [-1, -1];
  }, [text, target]);

  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    if (!done) {
      intervalId = window.setInterval(() => {
        setI((prev) => {
          const next = prev + 1;
          if (next >= text.length) {
            if (intervalId !== null) window.clearInterval(intervalId);
            setDone(true);
          }
          return next;
        });
      }, speed);
    } else {
      timeoutId = window.setTimeout(() => {
        setI(0);
        setDone(false);
      }, holdMs);
    }

    return () => {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [done, text, speed, holdMs]);

  const L = i;
  const pieces: { str: string; cls: string }[] = [];
  if (start === -1 || L <= start) {
    pieces.push({ str: text.slice(0, L), cls: baseClassName });
  } else if (L > start && L <= end) {
    pieces.push({ str: text.slice(0, start), cls: baseClassName });
    pieces.push({ str: text.slice(start, L), cls: highlightClassName });
  } else {
    pieces.push({ str: text.slice(0, start), cls: baseClassName });
    pieces.push({ str: text.slice(start, end), cls: highlightClassName });
    pieces.push({ str: text.slice(end, L), cls: baseClassName });
  }

  return (
    <span className={`whitespace-pre-wrap ${className}`} aria-label={text}>
      {pieces.map((p, idx) => (
        <span key={idx} className={p.cls}>
          {p.str}
        </span>
      ))}
      <span
        aria-hidden
        className={`ml-1 inline-block bg-current align-[-0.1em] ${caretClassName}`}
        style={{
          width: `${caretWidthEm}em`,
          height: `${caretHeightEm}em`,
          borderRadius: "1px",
          opacity: 0.9,
        }}
      />
    </span>
  );
}

export default function HeroSection() {
  const [imgRunId, setImgRunId] = useState(0);
  const restartPixel = () => setImgRunId((n) => n + 1);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-screen-xl px-6 py-16 sm:py-20 md:py-24">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-16">
          {/* 이미지 (좌) */}
          <div className="flex flex-col items-center space-y-4 md:w-1/2">
            {/* ✅ ShimmerButton으로 교체 */}
            <ShimmerButton
              onClick={restartPixel}
              className="rounded-[2.5rem] p-1 shadow-xl"
            >
              <PixelImage
                key={imgRunId}
                src="/myImage.jpg"
                grid="8x8"
                grayscaleAnimation
                pixelFadeInDuration={900}
                maxAnimationDelay={900}
                colorRevealDelay={1000}
                className="h-80 w-80 sm:h-[25rem] sm:w-[25rem] 
                           md:h-[32rem] md:w-[32rem]
                           rounded-[2.5rem] overflow-hidden bg-transparent"
              />
            </ShimmerButton>

            {/* 📌 감성 소개 텍스트 */}
            <div className="text-base text-neutral-600 dark:text-neutral-400 space-y-1 text-left">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span>📅</span>
                <span>1998.08.17</span>
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span>🎓</span>
                <span>연세대학교 행정학과 (졸)</span>
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span>🌱</span>
                <span>INFP</span>
              </p>
            </div>
          </div>

          {/* 텍스트 (우) */}
          <div className="w-full text-center md:w-1/2 md:text-left">
            <h1 className="font-extrabold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100">
              <TypingText
                text={"안녕하세요,\n\n오정록  입니다."}
                target="오정록"
                speed={200}
                holdMs={4000}
                baseClassName="text-2xl sm:text-2xl md:text-3xl text-neutral-500"
                highlightClassName="text-4xl sm:text-5xl md:text-6xl"
                caretWidthEm={0.18}
                caretHeightEm={2.5}
                caretClassName="caret-blink"
              />
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
