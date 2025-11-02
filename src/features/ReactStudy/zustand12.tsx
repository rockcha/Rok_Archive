// src/pages/zustand12.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCounter } from "./counterStore";

/* shadcn/ui */
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

/* 아이콘 (lucide-react) */
import { Plus, Minus, RotateCcw, ArrowUp, ArrowDown, Hash } from "lucide-react";

/** ✔ 추가 기능
 * - Step 조절
 * - Min/Max 범위(클램프)
 * - Reset
 * - 직접 입력(Set)
 * - 키보드 단축키(↑/↓, Shift+↑/↓는 10배)
 */
export default function ZustandDay14Counter() {
  const count = useCounter((s) => s.count);
  const step = useCounter((s) => s.step);
  const min = useCounter((s) => s.min);
  const max = useCounter((s) => s.max);

  const inc = useCounter((s) => s.inc);
  const dec = useCounter((s) => s.dec);
  const incBy = useCounter((s) => s.incBy);
  const decBy = useCounter((s) => s.decBy);
  const setVal = useCounter((s) => s.set);
  const reset = useCounter((s) => s.reset);
  const setStep = useCounter((s) => s.setStep);
  const setBounds = useCounter((s) => s.setBounds);

  const [tempValue, setTempValue] = useState<string>(String(count));
  const [tempMin, setTempMin] = useState<string>(String(min));
  const [tempMax, setTempMax] = useState<string>(String(max));
  const [tempStep, setTempStep] = useState<string>(String(step));

  // count가 바뀌면 입력창도 동기화
  useEffect(() => {
    setTempValue(String(count));
  }, [count]);

  // 키보드 단축키: ↑/↓, Shift+↑/↓(10배)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.shiftKey ? incBy(step * 10) : inc();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.shiftKey ? decBy(step * 10) : dec();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inc, dec, incBy, decBy, step]);

  // 진행률(미관): min~max 사이에서의 위치(0~100)
  const progress = useMemo(() => {
    if (max === min) return 0;
    const ratio = (count - min) / (max - min);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [count, min, max]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-2xl p-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
              Zustand 카운터
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 표시 영역 */}
            <div className="rounded-2xl border bg-white/70 p-6 text-center shadow-sm">
              <div className="text-sm text-slate-500">현재 값</div>
              <div className="mt-2 text-6xl font-extrabold tabular-nums tracking-tight">
                {count}
              </div>
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <div className="mt-2 text-xs text-slate-500">
                  {min} ~ {max} 범위 · {progress}%
                </div>
              </div>
            </div>

            {/* 컨트롤: 증가/감소 */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-12 rounded-2xl"
                    onClick={() => dec()}
                    aria-label="decrease by step"
                  >
                    <Minus className="mr-2 h-5 w-5" />-{step}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>감소 (단축키: ↓ / Shift+↓ ×10)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    className="h-12 rounded-2xl"
                    onClick={() => inc()}
                    aria-label="increase by step"
                  >
                    <Plus className="mr-2 h-5 w-5" />+{step}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>증가 (단축키: ↑ / Shift+↑ ×10)</TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                className="h-12 rounded-2xl"
                onClick={() => decBy(step * 10)}
                aria-label="decrease by 10x step"
              >
                <ArrowDown className="mr-2 h-5 w-5" />-{step * 10}
              </Button>

              <Button
                variant="ghost"
                className="h-12 rounded-2xl"
                onClick={() => incBy(step * 10)}
                aria-label="increase by 10x step"
              >
                <ArrowUp className="mr-2 h-5 w-5" />+{step * 10}
              </Button>
            </div>

            {/* 입력/설정 */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* 직접 값 설정 */}
              <div className="space-y-2">
                <Label htmlFor="value">값 직접 입력</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    type="number"
                    inputMode="numeric"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setVal(Number(tempValue))}
                  >
                    <Hash className="mr-2 h-4 w-4" />
                    Set
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  범위({min}~{max}) 밖이면 자동으로 클램프됩니다.
                </p>
              </div>

              {/* Step 설정 */}
              <div className="space-y-2">
                <Label htmlFor="step">Step (≥ 1)</Label>
                <div className="flex gap-2">
                  <Input
                    id="step"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={tempStep}
                    onChange={(e) => setTempStep(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setStep(Number(tempStep) || 1)}
                  >
                    적용
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  증감 단위를 변경합니다.
                </p>
              </div>

              {/* Min/Max 설정 */}
              <div className="space-y-2">
                <Label>최솟값 / 최댓값</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    className="rounded-xl"
                    aria-label="min"
                    placeholder="min"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    className="rounded-xl"
                    aria-label="max"
                    placeholder="max"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setBounds(Number(tempMin), Number(tempMax))}
                  >
                    적용
                  </Button>
                </div>
              </div>

              {/* Reset */}
              <div className="space-y-2">
                <Label>초기화</Label>
                <Button
                  variant="destructive"
                  className="h-12 w-full rounded-2xl"
                  onClick={reset}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  리셋
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-0"></CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
