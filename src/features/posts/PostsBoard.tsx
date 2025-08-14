// src/features/posts/PostsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import PostBox from "./PostBox";

type Props = {
  category: string; // 필수: 보여줄 카테고리
  limit?: number; // 옵션: 최대 개수 (기본 12)
  className?: string; // 외부 래퍼 커스터마이즈
  showHeader?: boolean; // 상단 헤더 노출 여부(기본 true)
};

type PostListItem = {
  id: string;
  slug: string;
  title: string;
  category_type: string | null;
  published_at: string | null;
};

export default function PostsBoard({
  category,
  limit = 12,
  className,
  showHeader = true,
}: Props) {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const normalized = useMemo(() => category?.trim().toLowerCase(), [category]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        const { data, error } = await supabase
          .from("posts")
          .select("id, slug, title, category_type, published_at")
          .eq("category_type", normalized)
          .not("published_at", "is", null) // 발행된 글만
          .order("published_at", { ascending: false })
          .range(0, Math.max(0, limit - 1));

        if (error) throw error;
        if (!cancelled) setItems(data ?? []);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "목록을 불러오지 못했습니다.";
        if (!cancelled) setErrMsg(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [normalized, limit]);

  return (
    <section className={cn("w-full", className)}>
      {showHeader && (
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {category} 카테고리
          </h3>
          <span className="text-xs text-zinc-500">{items.length} posts</span>
        </div>
      )}

      {loading && <GridSkeleton count={Math.min(limit, 8)} />}

      {!loading && errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

      {!loading && !errMsg && items.length === 0 && (
        <p className="text-sm text-zinc-500">아직 등록된 글이 없어요.</p>
      )}

      {!loading && !errMsg && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <PostBox
              key={p.id}
              id={p.id}
              slug={p.slug}
              title={p.title}
              category={p.category_type ?? "-"}
              // onClick={({ slug, id }) => {
              //   // TODO: 상세 라우팅 연결 (React Router 예시)
              //   // navigate(slug ? `/posts/${slug}` : `/posts/id/${id}`);
              //   console.log("TODO → navigate to post:", slug ?? id);
              // }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-xl border bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
