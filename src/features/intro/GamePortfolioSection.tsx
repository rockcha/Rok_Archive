// src/features/portfolio/GamePortfolioSection.tsx
"use client";

import YouTubeVideoDialog from "@/shared/magicui/hero-video-dialog";
import { cn } from "@/shared/lib/utils";

type VideoItem = {
  /** 전체 YouTube 링크 또는 videoId가 포함된 URL */
  url: string;
  /** 카드 상단 소제목 */
  title: string;
  /** 썸네일 아래/모달 내부 설명 */
  caption?: string;
  /** 기본 maxres, 실패 시 내부에서 hq로 폴백 */
  thumbnailQuality?: "maxres" | "hq";
};

type Props = {
  /** 섹션 메인 타이틀 */
  mainTitle?: string;
  /** 섹션 보조 설명 */
  subtitle?: string;
  /** 비디오 카드 리스트 (미지정 시 기본 3개 예시) */
  videos?: VideoItem[];
  /** 레이아웃 커스터마이즈용 */
  className?: string;
};

export default function GamePortfolioSection({
  mainTitle = "3인칭 소울류 게임 제작",
  subtitle = "썸네일을 눌러 제가 만든 게임을 확인해보세요 !🔊 소리 켜는 걸 추천!",
  videos = [
    {
      url: "https://youtu.be/u67kYiSMRP0",
      title: "폴리모프 및 공간이동 구현",
      caption: "캐릭터 폼 전환 + 공간이동 로직 (Unreal C++).",
      thumbnailQuality: "maxres",
    },
    {
      url: "https://youtu.be/ijnCtkSh9sE",
      title: "보스씬 1 — 레벨 기반 간단 보스씬",
      caption: "레벨 구성과 함께 기본 보스 패턴/연출.",
      thumbnailQuality: "maxres",
    },
    {
      url: "https://youtu.be/QNcdnuvVI_4",
      title: "보스씬 2 — 복잡한 보스 행동패턴",
      caption: "페이즈 전환/사용자 상태에 따른 패턴 변화",
      thumbnailQuality: "maxres",
    },
  ],
  className,
}: Props) {
  return (
    <section
      className={cn("mx-auto w-full max-w-screen-xl px-6 py-12", className)}
    >
      {/* 섹션 헤더 */}
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {mainTitle}
        </h2>
        {subtitle && (
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </header>

      {/* 3열 카드 그리드: 모바일 1열 → md 2열 → lg 3열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v, idx) => (
          <article
            key={`${v.url}-${idx}`}
            className="group rounded-xl border border-neutral-300 dark:border-neutral-700 p-4 transition-shadow hover:shadow-md"
          >
            {/* 카드 상단 소제목 */}
            <h3 className="text-lg font-medium leading-tight mb-3">
              {v.title}
            </h3>

            {/* 썸네일 클릭 → 모달 재생 */}
            <YouTubeVideoDialog
              url={v.url}
              caption={v.caption}
              className="w-full"
              thumbnailQuality={v.thumbnailQuality ?? "maxres"}
            />

            {/* 카드 하단 캡션(항상 노출) */}
            {v.caption && (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                {v.caption}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
