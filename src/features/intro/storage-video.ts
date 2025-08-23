// src/shared/lib/storage-video.ts
import { supabase } from "@/shared/lib/supabase";

/**
 * Storage에서 영상 1개 경로를 받아 재생 가능한 URL을 돌려준다.
 * - public 버킷이면 publicURL
 * - private 버킷이면 signedURL (기본 7일)
 */
export async function getStorageVideoUrl(opts: {
  bucket: string;
  path: string; // 예: "draft/my-demo.mp4"
  signed?: boolean; // private 버킷이면 true 권장
  expiresInSec?: number; // 서명 URL 유효기간(초). 기본 7일
}): Promise<string | null> {
  const {
    bucket,
    path,
    signed = false,
    expiresInSec = 60 * 60 * 24 * 7,
  } = opts;

  if (signed) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSec);
    if (error) return null;
    return data?.signedUrl ?? null;
  } else {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl ?? null;
  }
}

/**
 * prefix(폴더) 아래의 파일 목록을 최신순으로 가져온다.
 */
export async function listStorageVideos(opts: {
  bucket: string;
  prefix?: string; // 예: "draft"
  limit?: number;
}): Promise<{ name: string; id?: string }[]> {
  const { bucket, prefix = "", limit = 50 } = opts;
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error || !data) return [];
  // 하위 폴더 제외, 동영상 확장자만 필터(필요시 확장)
  const videoExt = [".mp4", ".webm", ".mov", ".m4v", ".mkv"];
  return data
    .filter(
      (f) => f.id && videoExt.some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    .map((f) => ({ name: f.name, id: f.id }));
}

/**
 * 원격 비디오 URL로부터 캔버스 썸네일 생성
 * (Supabase는 CORS 허용이라 crossOrigin='anonymous'로 캔버스 사용 가능)
 */
export async function captureThumbnailFromUrl(
  url: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    const onLoaded = () => {
      // 0초 프레임이 비어있는 영상 대비
      video.currentTime = Math.min(0.2, (video.duration || 1) * 0.05);
    };

    const onSeeked = () => {
      const w = video.videoWidth,
        h = video.videoHeight;
      if (!w || !h) return cleanup(null);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return cleanup(null);
      ctx.drawImage(video, 0, 0, w, h);
      cleanup(canvas.toDataURL("image/jpeg", 0.82));
    };

    const onError = () => cleanup(null);

    const cleanup = (result: string | null) => {
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve(result);
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
  });
}
