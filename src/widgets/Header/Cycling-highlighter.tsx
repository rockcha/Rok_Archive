// src/shared/magicui/cycling-highlighter.tsx
"use client";

import { useEffect, useState } from "react";
import { Highlighter } from "@/shared/magicui/highlighter";

type Step = {
  action: "box" | "highlight" | "underline";
  color: string;
  strokeWidth?: number;
  padding?: number;
  animationDuration?: number;
};

type Props = {
  children: React.ReactNode;
  // 각 단계가 유지되는 시간(ms)
  holdMs?: number;
};

export function CyclingHighlighter({ children, holdMs = 1200 }: Props) {
  const steps: Step[] = [
    {
      action: "box",
      color: "#3b82f6",
      strokeWidth: 1.5,
      padding: 4,
      animationDuration: 1200,
    }, // 파란 네모
    {
      action: "highlight",
      color: "#fde68a",
      strokeWidth: 1.5,
      padding: 4,
      animationDuration: 1200,
    }, // 형광펜(옅은 노랑)
    {
      action: "underline",
      color: "#ef4444",
      strokeWidth: 2,
      padding: 2,
      animationDuration: 1200,
    }, // 빨간 동그라미
  ];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIdx((i) => (i + 1) % steps.length), holdMs);
    return () => clearTimeout(t);
  }, [idx, holdMs, steps.length]);

  const s = steps[idx];

  // key를 바꿔서 Highlighter를 재마운트 → 각 단계가 깔끔히 전환
  return (
    <Highlighter
      key={idx}
      action={s.action}
      color={s.color}
      strokeWidth={s.strokeWidth}
      padding={s.padding}
      animationDuration={s.animationDuration}
    >
      {children}
    </Highlighter>
  );
}
