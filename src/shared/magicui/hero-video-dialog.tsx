// src/shared/magicui/youtube-video-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import { X, Play } from "lucide-react";
import { cn } from "@/shared/lib/utils";

function parseYouTubeId(input: string): string | null {
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return id;
      // /embed/VIDEOID
      const m = u.pathname.match(/\/embed\/([^/]+)/);
      if (m) return m[1];
    }
  } catch { void 0;}
  // 혹시 그냥 ID만 넘어오면 그대로 사용
  if (/^[\w-]{11}$/.test(input)) return input;
  return null;
}

type Props = {
  url: string; // 전체 URL 또는 videoId
  caption?: string;
  className?: string;
  thumbnailQuality?: "maxres" | "hq"; // maxres가 없으면 hq로 자동 폴백
};

export default function YouTubeVideoDialog({
  url,
  caption,
  className,
  thumbnailQuality = "maxres",
}: Props) {
  const [open, setOpen] = useState(false);

  const { id, thumb } = useMemo(() => {
    const id = parseYouTubeId(url);
    const base = id ? `https://img.youtube.com/vi/${id}` : "";
    // maxresdefault.jpg는 없을 수도 있으니 onError로 hqdefault로 폴백
    const thumb = id ? `${base}/${thumbnailQuality}default.jpg` : "";
    return { id, thumb };
  }, [url, thumbnailQuality]);

  if (!id)
    return <p className="text-red-600">유효하지 않은 YouTube URL입니다.</p>;

  return (
    <div className={cn("w-full", className)}>
      {/* 썸네일 카드 */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-xl border",
          "transition hover:shadow-md focus:outline-none"
        )}
        aria-label="동영상 재생"
      >
        <img
          src={thumb}
          alt="YouTube 썸네일"
          className="aspect-video w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }
          }}
        />
        {/* 플레이 아이콘 */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-full bg-black/60 p-4 transition group-hover:scale-105">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      </button>

      {/* 모달 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 rounded-md bg-black/60 p-2 text-white"
              aria-label="닫기"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {caption && (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
