// rps56.tsx
import React, { useMemo, useRef, useState } from "react";
import Box from "./Box";

type Choice = 1 | 2 | 3; // 1=가위, 2=바위, 3=보
type Result = "none" | "win" | "lose" | "draw";

const CHOICE_LABEL: Record<Choice, string> = {
  1: "가위",
  2: "바위",
  3: "보",
};

const CHOICE_EMOJI: Record<Choice, string> = {
  1: "✌️",
  2: "✊",
  3: "🖐️",
};

// 숫자 배열로 명시 (문자 키 이슈 방지)
const CHOICES: Choice[] = [1, 2, 3];

// (u - c + 3) % 3 === 0 -> 무승부, 1 -> 사용자 승, 2 -> 사용자 패
const judge = (u: Choice, c: Choice): Result => {
  const r = (u - c + 3) % 3;
  if (r === 0) return "draw";
  return r === 1 ? "win" : "lose";
};

type Stage = {
  stage: number;
  user: Choice;
  computer: Choice;
  result: Result; // 사용자 관점
  ts: number; // timestamp
};

const resultRing: Record<Result, string> = {
  none: "ring-slate-200",
  draw: "ring-amber-300",
  win: "ring-emerald-400",
  lose: "ring-rose-300",
};

const resultBadge: Record<Result, string> = {
  none: "bg-slate-100 text-slate-600",
  draw: "bg-amber-100 text-amber-800",
  win: "bg-emerald-100 text-emerald-800",
  lose: "bg-rose-100 text-rose-800",
};

export default function Rps56() {
  const [userChoice, setUserChoice] = useState<Choice>(1);
  const [computerChoice, setComputerChoice] = useState<Choice>(1);
  const [userState, setUserState] = useState<Result>("none");
  const [computerState, setComputerState] = useState<Result>("none");
  const [history, setHistory] = useState<Stage[]>([]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const play = (choice: Choice) => {
    const comp = (Math.floor(Math.random() * 3) + 1) as Choice;
    const result = judge(choice, comp);

    setUserChoice(choice);
    setComputerChoice(comp);
    setUserState(result);
    setComputerState(
      result === "win" ? "lose" : result === "lose" ? "win" : "draw"
    );

    setHistory((prev) => {
      const next: Stage = {
        stage: prev.length + 1,
        user: choice,
        computer: comp,
        result,
        ts: Date.now(),
      };
      return [...prev, next];
    });
  };

  const reset = () => {
    setUserState("none");
    setComputerState("none");
    setHistory([]);
  };

  const stats = useMemo(() => {
    const w = history.filter((h) => h.result === "win").length;
    const d = history.filter((h) => h.result === "draw").length;
    const l = history.filter((h) => h.result === "lose").length;
    return { w, d, l };
  }, [history]);

  const scrollBy = (dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-800">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">
            ✂️ 가위바위보
          </h1>
          <div className="flex items-center gap-2">
            <div className="hidden text-sm text-slate-600 md:block">
              <span className="mr-3">
                W: <b className="text-emerald-600">{stats.w}</b>
              </span>
              <span className="mr-3">
                D: <b className="text-amber-600">{stats.d}</b>
              </span>
              <span>
                L: <b className="text-rose-600">{stats.l}</b>
              </span>
            </div>
            <button
              onClick={reset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 active:scale-[.98]"
              aria-label="결과 및 히스토리 초기화"
            >
              초기화
            </button>
          </div>
        </header>

        {/* Main: 현재 보드 */}
        <main className="grid gap-6 md:grid-cols-2">
          <Box
            title="USER"
            choice={userChoice}
            state={userState}
            choiceLabel={CHOICE_LABEL[userChoice]}
          />
          <Box
            title="COMPUTER"
            choice={computerChoice}
            state={computerState}
            choiceLabel={CHOICE_LABEL[computerChoice]}
          />
        </main>

        {/* Controls */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            {CHOICES.map((c) => (
              <button
                key={c}
                onClick={() => play(c)}
                aria-label={`${CHOICE_LABEL[c]} 선택`}
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-base font-semibold shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-200 active:translate-y-0"
              >
                <span className="text-xl">{CHOICE_EMOJI[c]}</span>
                {CHOICE_LABEL[c]}
              </button>
            ))}
          </div>
        </section>

        {/* History */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">
              스테이지 히스토리
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollBy(-320)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
                aria-label="히스토리 왼쪽으로 스크롤"
              >
                ←
              </button>
              <button
                onClick={() => scrollBy(320)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
                aria-label="히스토리 오른쪽으로 스크롤"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="group/scroll relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
            role="list"
            aria-label="스테이지별 결과 히스토리"
          >
            {/* 페이드 가드(양쪽) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-indigo-50/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-indigo-50/80 to-transparent" />

            {history.length === 0 ? (
              <div className="w-full snap-start">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500">
                  아직 히스토리가 없어요. 위에서 가위/바위/보를 선택해 첫
                  스테이지를 시작해보세요!
                </div>
              </div>
            ) : (
              history.map((h) => <HistoryCard key={h.ts} data={h} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** 히스토리 카드 (가로 스크롤용) */
function HistoryCard({ data }: { data: Stage }) {
  const { stage, user, computer, result } = data;

  return (
    <article
      role="listitem"
      className={[
        "snap-start min-w-[200px] md:min-w-[240px]",
        "rounded-2xl bg-white p-4 ring-2 shadow-sm transition-all",
        resultRing[result],
      ].join(" ")}
      aria-label={`${stage} 스테이지: 결과 ${labelOf(result)}`}
      title={`${stage} 스테이지`}
    >
      <header className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2">
            {stage}
          </span>
          Stage
        </span>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            resultBadge[result],
          ].join(" ")}
        >
          {labelOf(result)}
        </span>
      </header>

      <div className="grid grid-cols-2 items-center gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-700">USER</div>
          <div className="my-1 text-3xl">{CHOICE_EMOJI[user]}</div>
          <div className="text-xs text-slate-600">{CHOICE_LABEL[user]}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-700">CPU</div>
          <div className="my-1 text-3xl">{CHOICE_EMOJI[computer]}</div>
          <div className="text-xs text-slate-600">{CHOICE_LABEL[computer]}</div>
        </div>
      </div>

      <footer className="mt-3 text-center text-xs text-slate-500">
        {result === "win" && "🎉 멋져요! 이 라운드 승리"}
        {result === "draw" && "😶 무승부… 다시 도전?"}
        {result === "lose" && "💪 다음 라운드에 뒤집자!"}
      </footer>
    </article>
  );
}

function labelOf(r: Result) {
  switch (r) {
    case "win":
      return "WIN";
    case "lose":
      return "LOSE";
    case "draw":
      return "DRAW";
    default:
      return "READY";
  }
}
