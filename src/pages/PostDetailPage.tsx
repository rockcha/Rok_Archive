// src/features/posts/pages/PostDetailPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";
import { Separator } from "@/shared/ui/separator";
import PostContentView from "@/features/posts/PostContentView";
import PostActions from "@/features/posts/PostActions";
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
  category_id: string | number | null; // ✅ id로 보관
  categories?: { name: string } | null; // ✅ FK 조인 결과
  tags: string[];
  content_json: unknown | null;
  content_markdown: string | null;
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
            "id, slug, title, category_id, categories(name), tags, content_json, content_markdown, summary, created_at, updated_at, published_at"
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
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="h-8 w-2/3 animate-pulse rounded bg-background dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-background dark:bg-zinc-800" />
        <Separator className="my-4" />
        <div className="h-64 animate-pulse rounded-xl border bg-background dark:bg-zinc-800" />
      </div>
    );
  }

  if (err || !post) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <p className="text-sm text-red-600">
          {err ?? "존재하지 않는 글입니다."}
        </p>
      </div>
    );
  }

  // const catName = post.categories?.name ?? "Uncategorized";

  return (
    <article className=" mx-auto w-full max-w-screen-lg border-l border-r px-6 py-6">
      {/* 헤더 */}
      <header className="text-center">
        <h1 className="text-3xl font-bold">{post.title}</h1>

        <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-xm text-zinc-500">
          {post.tags?.length > 0 && (
            <span>· {post.tags.map((t) => `#${t}`).join(" ")}</span>
          )}
          {post.published_at && (
            <span>· {new Date(post.published_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* 관리자 액션 */}
        <div className="mt-3">
          <PostActions postId={post.id} slug={post.slug} />
        </div>
      </header>

      <Separator className="my-4" />

      {/* 본문 */}
      <PostContentView
        contentJson={normalizeContentJson(post.content_json)}
        contentMarkdown={post.content_markdown}
      />
    </article>
  );
}
