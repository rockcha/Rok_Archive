// src/features/posts/editor/uploadImageSupabase.ts
import { supabase } from "@/shared/lib/supabase";

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET ?? "post-images";
const IS_PUBLIC =
  (import.meta.env.VITE_SUPABASE_BUCKET_PUBLIC ?? "true") === "true";

export async function uploadImageSupabase(opts: {
  file: File;
  postId?: string;
  userId?: string;
  bucket?: string;
}) {
  const { file, postId = "draft", userId, bucket = DEFAULT_BUCKET } = opts;

  if (!file.type.startsWith("image/"))
    throw new Error("이미지 파일만 업로드할 수 있어요.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("이미지는 최대 10MB까지 가능합니다.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const key = `${
    userId ? userId + "/" : ""
  }${postId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(key, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  let url: string;
  if (IS_PUBLIC) {
    url = supabase.storage.from(bucket).getPublicUrl(key).data.publicUrl;
  } else {
    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrl(key, 60 * 60 * 24); // 24h
    url = signed!.signedUrl;
  }

  // (선택) 원본 크기
  const dims = await (async () =>
    new Promise<{ width: number; height: number }>((res, rej) => {
      const img = new Image();
      img.onload = () => res({ width: img.width, height: img.height });
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    }).catch(() => ({} as any)))();

  return { url, path: key, alt: file.name, ...dims };
}
