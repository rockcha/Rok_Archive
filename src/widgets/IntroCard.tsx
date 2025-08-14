// src/widgets/IntroCard.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Minus, User2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import ojrProfile from "@/shared/assets/ojr-profile.png";

type IntroCardProps = {
  photoUrl?: string;
  name?: string;
  birth?: string; // e.g. "1998. 03. 14"
  school?: string; // e.g. "연세대학교"
  major?: string; // e.g. "행정학과"
  stacks?: string[]; // e.g. ["React","TypeScript","Tailwind","Supabase"]
  className?: string;
};

export default function IntroCard({
  photoUrl = "@/shared/assets/ojr-profile.png", // public/ 에 이미지 두면 이렇게 접근
  name = "오정록",
  birth = "1998. 08. 17",
  school = "연세대학교 (졸)",
  major = "행정학과",
  stacks = ["React", "TypeScript", "Tailwind CSS", "Python(FastAPI/Django)"],
  className,
}: IntroCardProps) {
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* 펼쳐진 상태: 우하단 고정 카드 */}
      {!minimized && (
        <div
          className="fixed top-28 right-4 z-50
             w-[18rem] sm:w-[20rem] md:w-[22rem] lg:w-[24rem]   /* 가로: 작게 */
             h-[70vh] sm:h-[74vh] md:h-[78vh] lg:h-[82vh]       /* 세로: 길게 */
             max-w-[92vw] max-h-[92vh]"
        >
          <Card
            className={cn(
              "rounded-2xl border-zinc-200/70 bg-white/90 dark:bg-zinc-900/80 backdrop-blur shadow-lg",
              "ring-1 ring-zinc-200/60 dark:ring-zinc-800/60",
              className
            )}
          >
            <CardHeader className="relative pb-2">
              {/* 상단 액센트 라인 */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-100 dark:bg-zinc-800">
                    {photoUrl ? (
                      // 아바타
                      <img
                        src={ojrProfile}
                        alt={`${name} 프로필`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <User2 />
                      </div>
                    )}
                  </div>
                  <div className="leading-tight">
                    <h3 className="text-xl font-bold tracking-tight">{name}</h3>
                    <p className="text-xs text-zinc-500">{birth}</p>
                  </div>
                </div>

                {/* 최소화 버튼 */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full hover:cursor-pointer"
                  aria-label="카드 최소화"
                  onClick={() => setMinimized(true)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-semibold">학교</span>
                  <span className="mx-2 text-zinc-400">·</span>
                  {school}
                </div>
                <div className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-semibold">전공</span>
                  <span className="mx-2 text-zinc-400">·</span>
                  {major}
                </div>
              </div>

              <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />

              <div>
                <p className="mb-2 text-xs semibold text-zinc-500">주 스택</p>
                <div className="flex flex-wrap gap-2">
                  {stacks.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100
                                 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900/50"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <p className="text-xs text-zinc-500">
                코드와 생각이 머무는 공간 · 록차 기록소
              </p>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 최소화 상태: 우하단 작은 고정 버튼(칩) */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className={cn(
            "fixed top-26 right-4 z-50",
            "flex items-center gap-2 rounded-full border border-zinc-200/70 dark:border-zinc-800/70",
            "bg-white/90 dark:bg-zinc-900/80 backdrop-blur shadow-lg",
            "px-3 py-2 hover:cursor-pointer"
          )}
          aria-label="소개 카드 열기"
          title="소개"
        >
          🖐️
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            나를 소개합니다
          </span>
        </button>
      )}
    </>
  );
}
