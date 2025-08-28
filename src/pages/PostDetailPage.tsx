// src/features/posts/pages/PostDetailPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";
import { Separator } from "@/shared/ui/separator";
import PostContentView from "@/features/posts/PostContentView";
import PostActions from "@/features/posts/PostActions";
import FloatingMemo from "@/widgets/FloatingMemo";
import HomeButton from "@/widgets/Header/HomeButton";
import type { JSONContent } from "@tiptap/core";

// unknown을 안전한 타입으로 변환
function normalizeContentJson(v: unknown): JSONContent | string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") return v as JSONContent;
  return null;
}

type Post = {
  id: string;
  slug: string;
  title: string;
  category_id: string | number | null;
  categories?: { name: string } | null;
  tags: string[];
  content_json: unknown | null; // ✅ markdown 제거
  summary?: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export default function PostDetailPage() {
  const params = useParams<{ slug?: string; id?: string }>();
  const slug = params.slug;
  const idParam = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const queryBy = useMemo<"slug" | "id">(() => (slug ? "slug" : "id"), [slug]);
  const value = slug ?? idParam ?? "";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // ✅ category_id + categories(name) 조인으로 카테고리명까지 한 번에
        let q = supabase
          .from("posts")
          .select(
            "id, slug, title, category_id, categories(name), tags, content_json, created_at, updated_at, published_at"
          )
          .limit(1);

        q = queryBy === "slug" ? q.eq("slug", value) : q.eq("id", value);

        const { data, error } = await q.single<Post>();
        if (error) throw error;
        if (!alive) return;
        setPost(data);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "게시글을 불러오지 못했습니다.";
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [queryBy, value]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-screen-lg px-4 py-6">
        <div className="h-8 w-2/3 animate-pulse rounded bg-background dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-background dark:bg-zinc-800" />
        <Separator className="my-4" />
        <div className="h-64 animate-pulse rounded-xl border bg-background dark:bg-zinc-800" />
      </div>
    );
  }

  if (err || !post) {
    return (
      <div className="mx-auto w-full max-w-screen-lg px-4 py-6">
        <p className="text-sm text-red-600">
          {err ?? "존재하지 않는 글입니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <header className="space-y-2">
        {/* 1행: 제목 가운데 + 홈버튼 우측(오버레이) */}

        <h1 className="text-2xl font-bold text-center">{post.title}</h1>

        {/* 2행: 태그/날짜 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
          {post.tags?.length > 0 && (
            <span>· {post.tags.map((t) => `#${t}`).join(" ")}</span>
          )}
          {post.published_at && (
            <span>{new Date(post.published_at).toLocaleDateString()}</span>
          )}
        </div>
      </header>
      <Separator className="my-4" />
      <div className="flex justify-between mb-3">
        <div className="flex gap-1">
          <HomeButton />
          <FloatingMemo />
        </div>

        <div>
          <PostActions postId={post.id} slug={post.slug} />
        </div>
      </div>
      {/* ── 본문(내부 스크롤, 보더 고정) ───────────────────── */}
      <div className="rounded-lg border border-neutral-300 bg-background">
        <div
          className={[
            // 안쪽만 스크롤
            "max-h-[80vh] overflow-y-auto ",

            // 스크롤 끝 여유
            "after:block after:h-4",
            // 스크롤바 스타일/안정화
            "[scrollbar-gutter:stable_both-edges]",
            "[scrollbar-width:thin] [-ms-overflow-style:auto]",
            "[&::-webkit-scrollbar]:w-2",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-zinc-300/70]",
            "dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/70]",
          ].join(" ")}
          aria-label="게시글 본문 스크롤 영역"
          role="region"
        >
          <div
            className="
      [&_>div]:border-0 [&_>div]:rounded-none [&_>div]:bg-transparent
      [&_.tiptap]:border-0 [&_.tiptap]:rounded-none [&_.tiptap]:bg-transparent
      [&_.ProseMirror]:border-0 [&_.ProseMirror]:rounded-none [&_.ProseMirror]:bg-transparent
    "
          >
            <PostContentView
              contentJson={normalizeContentJson(post.content_json)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
