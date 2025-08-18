// src/features/posts/pages/PostEditPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";
import PostComposer from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";
import type { JSONContent } from "@tiptap/core";

function normalizeContentJson(v: unknown): JSONContent | string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") return v as JSONContent;
  return null;
}

type PostRow = {
  id: string;
  title: string | null;
  category_id: string | number | null;
  tags: string[] | null;
  content_json: unknown | null;
  slug: string | null;
};

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostRow | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, category_id, tags, content_json, slug")
          .eq("id", id)
          .single<PostRow>();
        if (error) throw error;
        if (alive) setPost(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "글을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-6">
        <div className="h-7 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <Separator className="my-4" />
        <div className="h-64 animate-pulse rounded-xl border bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (err || !post) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-6">
        <p className="text-sm text-red-600">
          {err ?? "존재하지 않는 글입니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-6">
      <h1 className="text-2xl font-bold">글 수정</h1>
      <p className="mt-1 text-sm text-zinc-500">
        제목 · 카테고리 · 태그는 필수입니다.
      </p>
      <Separator className="my-4" />
      <PostComposer
        mode="edit"
        initial={{
          id: post.id,
          title: post.title ?? "",
          categoryId: post.category_id ?? "",
          tags: post.tags ?? [],
          content: normalizeContentJson(post.content_json),
        }}
        onSaved={(pid) => navigate(`/posts/id/${pid}`)}
      />
    </div>
  );
}
