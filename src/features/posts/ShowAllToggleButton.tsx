"use client";

import { cn } from "@/shared/lib/utils";

type ShowAllToggleProps = {
  value: boolean; // true = showall, false = idle
  onChange: (v: boolean) => void;
  className?: string;
  offLabel?: string; // 기본: "Idle"
  onLabel?: string; // 기본: "Show all"
};

export default function ShowAllToggle({
  value,
  onChange,
  className,
  offLabel = "Idle",
  onLabel = "Show all",
}: ShowAllToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1",
        "transition-colors select-none",
        value
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      <span className="text-xs font-medium">{value ? onLabel : offLabel}</span>
      <span
        className={cn(
          "relative h-5 w-10 rounded-full bg-zinc-300/80 dark:bg-zinc-700/80",
          "transition-colors"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow",
            "transition-transform",
            value ? "translate-x-6" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}
