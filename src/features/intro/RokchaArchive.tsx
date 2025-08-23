// src/features/intro/rokchaArchive.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { ShimmerButton } from "@/shared/magicui/shimmer-button";

//이미지 파일
import dataTablePng from "@/shared/assets/rokchaArchive/dataTable.png";
import searchBarPng from "@/shared/assets/rokchaArchive/searchBar.png";
import richEditorPng from "@/shared/assets/rokchaArchive/richEditor.png";
import widgetPng from "@/shared/assets/rokchaArchive/widget.png";

export default function RokchaArchive() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-screen-lg px-3 py-5">
      {/* 헤더 (조금 더 컴팩트) */}
      <header className="mb-4 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-800">
          록차 아카이브
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <strong>검색 기능</strong>과 다른 편의 기능들을 탑재한{" "}
          <strong>직접 만든 블로그</strong>를 소개합니다.
        </p>
      </header>

      {/* 2x2 카드 + 중앙 버튼 */}
      <div className="relative">
        <div className={cn("grid grid-cols-1 gap-2.5 md:grid-cols-2")}>
          {/* 1 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={dataTablePng}
                alt="데이터 관리"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                데이터 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              Supabase DB(SQL)와 Storage를 연동해 다양한 데이터를 처리하고,
              이미지·영상 같은 파일도 함께 관리합니다.
            </CardContent>
          </Card>

          {/* 2 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={searchBarPng}
                alt="고급 검색"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                고급 검색
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              내가 입력한 제목과 태그로 게시물을 <strong>검색</strong>할 수
              있습니다.
            </CardContent>
          </Card>

          {/* 3 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={richEditorPng}
                alt="리치 에디터"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                리치 에디터
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              글머리 기호, 이미지 삽입, 하이라이트, 줄바꿈 등
              <strong> 글 작성과 수정에 필요한 에디터 기능</strong>들을
              구현했습니다.
            </CardContent>
          </Card>

          {/* 4 */}
          <Card className="overflow-hidden">
            <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-900">
              <img
                src={widgetPng}
                alt="생산성 위젯"
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="py-2">
              <CardTitle className="text-base font-semibold">
                생산성 위젯
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 text-sm leading-snug text-neutral-700 dark:text-neutral-300">
              <strong>일정 관리, Todo, 메모장 등 생산성 위젯</strong>을
              제공합니다.
            </CardContent>
          </Card>
        </div>

        {/* 중앙 CTA 버튼 - ShimmerButton */}
        <div className="absolute inset-0 grid place-items-center">
          <ShimmerButton
            onClick={() => navigate("/main")}
            className="shadow-2xl"
            shimmerSize="0.2em"
          >
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
              구경하러가기👀
            </span>
          </ShimmerButton>
        </div>
      </div>
    </section>
  );
}
