// src/widgets/RotatingQuotes.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const QUOTES = [
  {
    text: '"프로그램은 사람이 읽도록 쓰여야 하며, 기계가 실행하는 건 부차적이다."',
    author: "Harold Abelson & Gerald J. Sussman",
  },
  {
    text: '"세상에는 딱 두 가지 언어가 있다. 사람들이 욕하는 언어, 아무도 사용하지 않는 언어."',
    author: "Bjarne Stroustrup, C++의 창시자",
  },
  {
    text: '"좋은 코드는 그 자체로 최고의 문서다."',
    author: "Steve McConnell",
  },
];

export default function RotatingQuotes() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing"
  );

  // 속도/딜레이 설정
  const typingSpeed = 100; // ms
  const deletingSpeed = 40; // ms
  const pauseDuration = 5200; // ms

  const full = useMemo(() => Array.from(QUOTES[idx].text), [idx]);

  // 현재 배열에서 가장 긴 문장 (폭 고정용)
  const LONGEST_QUOTE = useMemo(
    () =>
      QUOTES.reduce((a, b) => (a.text.length >= b.text.length ? a : b)).text,
    []
  );

  useEffect(() => {
    let t: number | null = null;

    if (phase === "typing") {
      if (text.length < full.length) {
        t = window.setTimeout(() => {
          setText((prev) => prev + full[prev.length]);
        }, typingSpeed);
      } else {
        t = window.setTimeout(() => setPhase("pausing"), pauseDuration);
      }
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        t = window.setTimeout(() => {
          setText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIdx((i) => (i + 1) % QUOTES.length);
        setPhase("typing");
      }
    }

    if (phase === "pausing") {
      t = window.setTimeout(() => setPhase("deleting"), 300);
    }

    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [phase, text, full, typingSpeed, deletingSpeed, pauseDuration]);

  useEffect(() => {
    if (text.length === 0 && phase !== "typing") setPhase("typing");
  }, [idx, phase, text.length]);

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        {/* 명언(타이핑) - 폭 고정 */}
        <p className="relative inline-block whitespace-nowrap text-xs md:text-base leading-8 text-zinc-800 dark:text-zinc-100">
          {/* 폭만 잡는 더 긴 문장 */}
          <span className="invisible block" aria-hidden="true">
            {LONGEST_QUOTE}
          </span>
          {/* 실제 타이핑 텍스트를 겹쳐서 표시 */}
          <span className="absolute inset-0">
            {text}
            <span className="ml-1 inline-block h-[1.1em] w-[2px] align-[-0.15em] bg-current animate-pulse" />
          </span>
        </p>

        {/* 저자(다음 줄) */}
        <p className="mt-2 text-sm md:text-xs text-zinc-500 dark:text-zinc-400">
          — {QUOTES[idx].author}
        </p>
      </div>
    </div>
  );
}
