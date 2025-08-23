// src/features/intro/Gamjaring.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { ShimmerButton } from "@/shared/magicui/shimmer-button";

// 이미지 파일 import
import questionPng from "@/shared/assets/gamjaring/question.png";
import realtimePng from "@/shared/assets/gamjaring/realtime.png";
import potatoLevelPng from "@/shared/assets/gamjaring/potatoLevel.png";
import devNotePng from "@/shared/assets/gamjaring/devNote.png";

export default function Gamjaring() {
  return (
    <section className="mx-auto w-full max-w-screen-lg px-3 py-5">
      {/* 헤더 */}
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">
          감자링
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          커플이 함께 매일 <strong>질문에 답하고</strong> 감자를 키워나가는
          재미를 느낄 수 있는 서비스입니다.
        </p>
      </header>

      {/* 2x2 카드 + 중앙 버튼 */}
      <div className="relative">
        <div className={cn("grid grid-cols-1 gap-2.5 md:grid-cols-2")}>
          {/* 1. 매일 질문 업데이트 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={questionPng}
                alt="매일 질문 업데이트"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                매일 질문 업데이트
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              <strong>서버 시간 체크</strong>를 통해 매일 새로운 질문이 열리고,
              커플이 함께 답변을 이어갈 수 있습니다.
            </CardContent>
          </Card>

          {/* 2. 실시간 알림(realtime 구독) */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={realtimePng}
                alt="실시간 알림"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                실시간 알림
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              <strong>Supabase Realtime 구독</strong> 으로 커플 요청·답변·알림
              이벤트를 즉시 전송합니다.
            </CardContent>
          </Card>

          {/* 3. 감자 레벨 업 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={potatoLevelPng}
                alt="감자 레벨 업"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                감자 레벨 올리기
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              답변과 상호작용으로 포인트를 모아 감자 레벨을 올리고 성장의 재미를
              느낄 수 있습니다.
            </CardContent>
          </Card>

          {/* 4. 개발자 노트 + 실제 사용 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={devNotePng}
                alt="개발자 노트"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                개발자 노트 · 실사용
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              <strong>개발자 노트</strong>를 통해 지속적으로 새로운 버전을
              배포하고, 실제 커플 지인들이 사용하는 환경에서 피드백을 받습니다.
            </CardContent>
          </Card>
        </div>

        {/* 중앙 CTA 버튼 - ShimmerButton 단순 사용 */}
        <div className="absolute inset-0 grid place-items-center">
          <a
            href="https://gamja-ring.vercel.app/intro"
            target="_blank"
            rel="noreferrer"
            className="inline-block"
          >
            <ShimmerButton className="shadow-2xl" shimmerSize="0.2em">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg ">
                구경하러가기👀
              </span>
            </ShimmerButton>
          </a>
        </div>
      </div>
    </section>
  );
}
