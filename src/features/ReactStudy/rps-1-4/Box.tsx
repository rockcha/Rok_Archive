import React from "react";

type Choice = 1 | 2 | 3; // 1=가위, 2=바위, 3=보
type Result = "none" | "win" | "lose" | "draw";

type Props = {
  title: string;
  choice: Choice;
  state: Result;
  choiceLabel?: string; // 접근성/대체 텍스트
};

const stateRing: Record<Result, string> = {
  none: "ring-slate-200",
  draw: "ring-amber-300",
  win: "ring-emerald-400",
  lose: "ring-rose-300",
};

const stateBadge: Record<Result, string> = {
  none: "bg-slate-100 text-slate-600",
  draw: "bg-amber-100 text-amber-800",
  win: "bg-emerald-100 text-emerald-800",
  lose: "bg-rose-100 text-rose-800",
};

const stateLabel: Record<Result, string> = {
  none: "READY",
  draw: "DRAW",
  win: "WIN",
  lose: "LOSE",
};

const choiceAlt: Record<Choice, string> = {
  1: "가위 이미지",
  2: "바위 이미지",
  3: "보 이미지",
};

const emojiFallback: Record<Choice, string> = {
  1: "✌️",
  2: "✊",
  3: "🖐️",
};

const Box: React.FC<Props> = ({ title, choice, state, choiceLabel }) => {
  const src = `/images/${choice}.png`;

  return (
    <article
      className={[
        "relative rounded-3xl bg-white p-5 shadow-sm ring-2 transition-all",
        stateRing[state],
      ].join(" ")}
      aria-live="polite"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            stateBadge[state],
          ].join(" ")}
          aria-label={`상태: ${stateLabel[state]}`}
        >
          {stateLabel[state]}
        </span>
      </header>

      <div className="flex items-center justify-center">
        {/* 이미지가 없을 때를 대비해 onError로 대체 이모지 표시 */}
        <img
          src={src}
          alt={choiceAlt[choice]}
          className="h-48 w-48 select-none object-contain"
          onError={(e) => {
            // 이미지가 없으면 이모지 fallback
            const target = e.currentTarget;
            target.style.display = "none";
            const sibling = target.nextElementSibling as HTMLDivElement | null;
            if (sibling) sibling.style.display = "flex";
          }}
          draggable={false}
        />
        <div
          className="hidden h-48 w-48 items-center justify-center text-6xl"
          aria-hidden
        >
          {emojiFallback[choice]}
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-center">
        <span className="rounded-xl bg-slate-50 px-3 py-1 text-sm text-slate-600">
          선택:{" "}
          <strong className="font-semibold text-slate-900">
            {choiceLabel}
          </strong>
        </span>
      </footer>
    </article>
  );
};

export default Box;
