// src/features/portfolio/GamePortfolioSection.tsx
"use client";

import YouTubeVideoDialog from "@/shared/magicui/hero-video-dialog";

type Props = {
  /** 전체 YouTube 링크 또는 videoId */
  youtubeUrl?: string;
  /** 섹션 타이틀/설명 */
  title?: string;
  caption?: string;
  /** 썸네일 품질: 기본 maxres, 실패 시 컴포넌트 내부에서 hq로 폴백 */
  thumbnailQuality?: "maxres" | "hq";
  /** 레이아웃 커스터마이즈용 */
  className?: string;
};

export default function GamePortfolioSection({
  youtubeUrl = "https://www.youtube.com/watch?v=3V-Krr8UIqY",
  title = "보스 전투씬",
  caption = "Unreal 엔진을 이용해 UI, 스킬 효과 , 보스 AI 패턴을 구현했습니다.",
  thumbnailQuality = "maxres",
  className,
}: Props) {
  return (
    <section
      className={`mx-auto w-full max-w-screen-lg px-6 py-12 ${className ?? ""}`}
    >
      <header className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-base text-neutral-500 dark:text-neutral-400">
          내돈내산 배경음악도 삽입했으니 소리 켜주세요🔊
        </p>
      </header>

      <div className="rounded-lg border border-neutral-300 p-4 text-base dark:border-neutral-700">
        {/* 썸네일 클릭 → 모달로 재생 */}
        <YouTubeVideoDialog
          url={youtubeUrl}
          caption={caption} // 모달 내부에 표시
          className="mx-auto max-w-4xl"
          thumbnailQuality={thumbnailQuality}
        />
        {/* 항상 썸네일 아래에도 캡션을 보여주고 싶다면 아래 p 유지 */}
        {caption && (
          <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
