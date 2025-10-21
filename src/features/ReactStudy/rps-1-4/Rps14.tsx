// Rps14.tsx
import { useState } from "react";
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

// ✅ 숫자 배열을 명시적으로 사용 (문자열 키 문제 방지)
const CHOICES: Choice[] = [1, 2, 3];

// ✅ 모듈로 연산으로 깔끔하게 판정
// (u - c + 3) % 3 === 0 -> 무승부, 1 -> 사용자 승, 2 -> 사용자 패
const judge = (u: Choice, c: Choice): Result => {
  const r = (u - c + 3) % 3;
  if (r === 0) return "draw";
  return r === 1 ? "win" : "lose";
};

export default function Rps14() {
  const [userChoice, setUserChoice] = useState<Choice>(1);
  const [computerChoice, setComputerChoice] = useState<Choice>(1);
  const [userState, setUserState] = useState<Result>("none");
  const [computerState, setComputerState] = useState<Result>("none");

  const play = (choice: Choice) => {
    const comp = (Math.floor(Math.random() * 3) + 1) as Choice;
    const result = judge(choice, comp);

    setUserChoice(choice);
    setComputerChoice(comp);
    setUserState(result);
    setComputerState(
      result === "win" ? "lose" : result === "lose" ? "win" : "draw"
    );

    // 디버그
    console.log("user:", choice, "computer:", comp, "result:", result);
  };

  const reset = () => {
    setUserState("none");
    setComputerState("none");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-800">
      <div className="mx-auto max-w-4xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">
            ✂️ 가위바위보
          </h1>
          <button
            onClick={reset}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 active:scale-[.98]"
            aria-label="결과 초기화"
          >
            초기화
          </button>
        </header>

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
      </div>
    </div>
  );
}
