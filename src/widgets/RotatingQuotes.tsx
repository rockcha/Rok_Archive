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
  const [idx, setIdx] = useState(0); // 현재 명언 인덱스
  const [text, setText] = useState(""); // 화면에 표시되는 타이핑 중 텍스트
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing"
  );

  // 속도/딜레이 설정
  const typingSpeed = 100; // ms, 타이핑 속도
  const deletingSpeed = 40; // ms, 지우는 속도
  const pauseDuration = 5200; // ms, 한 문장 타이핑 완료 후 멈춤 시간

  const full = useMemo(() => Array.from(QUOTES[idx].text), [idx]);

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
        // 다음 문장으로
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

  // 초기/변경 시 타이핑 시작
  useEffect(() => {
    if (text.length === 0 && phase !== "typing") setPhase("typing");
  }, [idx, phase, text.length]);

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        {/* 명언(타이핑) */}
        <p className="text-lg md:text-xl leading-8 text-zinc-800 dark:text-zinc-100">
          {text}
          <span className="ml-1 inline-block h-[1.1em] w-[2px] align-[-0.15em] bg-current animate-pulse" />
        </p>

        {/* 저자(다음 줄) */}
        <p className="mt-2 text-sm md:text-xs text-zinc-500 dark:text-zinc-400">
          — {QUOTES[idx].author}
        </p>
      </div>
    </div>
  );
}
