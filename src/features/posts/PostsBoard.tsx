// src/features/posts/PostsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import PostBox from "./PostBox";
import { useNavigate } from "react-router-dom";
// ❌ shadcn ScrollArea/ScrollBar 제거
// import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";

type Props = {
  headerLabel?: string;
  postIds?: string[];
  categoryId?: number | null;
  limit?: number;
  className?: string;
  showHeader?: boolean;
  showAll?: boolean;
};

type PostRow = {
  id: string;
  slug: string | null;
  title: string | null;
  tags: string[] | null;
  category_id: string | number | null;
  categories?: { name: string }[] | { name: string } | null;
  published_at: string | null;
};

const FIELDS =
  "id, slug, title, tags, category_id, categories(name), published_at";

export default function PostsBoard({
  postIds,
  categoryId = null,
  limit = 12,
  className,
  showAll = false,
}: Props) {
  const [items, setItems] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const idsMode = useMemo(() => postIds !== undefined, [postIds]);
  const idsKey = useMemo(
    () => (postIds ? postIds.join("|") : "__no_ids__"),
    [postIds]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        if (idsMode) {
          if (!postIds || postIds.length === 0) {
            if (!cancelled) setItems([]);
            return;
          }

          const targetIds = showAll
            ? postIds
            : postIds.slice(0, Math.max(0, limit));

          const { data, error } = await supabase
            .from("posts")
            .select(FIELDS)
            .in("id", targetIds)
            .not("published_at", "is", null);

          if (error) throw error;

          const orderMap = new Map(
            targetIds.map((id, idx) => [id, idx] as const)
          );
          const sorted = (data ?? [])
            .filter((p) => orderMap.has(p.id))
            .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

          if (!cancelled) setItems(sorted as PostRow[]);
        } else {
          let base = supabase
            .from("posts")
            .select(FIELDS)
            .not("published_at", "is", null)
            .order("published_at", { ascending: false });

          if (categoryId !== null && categoryId !== undefined) {
            base = base.eq("category_id", categoryId);
          }

          if (showAll) {
            const PAGE = 100;
            let offset = 0;
            const acc: PostRow[] = [];

            while (true) {
              const { data, error } = await base.range(
                offset,
                offset + PAGE - 1
              );
              if (error) throw error;

              const chunk = (data ?? []) as PostRow[];
              acc.push(...chunk);

              if (!chunk.length || chunk.length < PAGE) break;
              offset += PAGE;
            }
            if (!cancelled) setItems(acc);
          } else {
            const { data, error } = await base.range(0, Math.max(0, limit - 1));
            if (error) throw error;
            if (!cancelled) setItems((data ?? []) as PostRow[]);
          }
        }
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
  }, [idsMode, idsKey, categoryId, limit, showAll]);

  const skeletonCount = useMemo(() => {
    if (idsMode) {
      const n = postIds?.length ?? 0;
      return showAll
        ? Math.min(n || 8, 8)
        : Math.min(limit, n || 0) || Math.min(limit, 8);
    }
    return Math.min(limit, 8);
  }, [idsMode, postIds, limit, showAll]);

  const handlePostClick = (postId: string) => {
    navigate(`/posts/id/${postId}`);
  };

  const pickCategoryName = (c: PostRow["categories"]) =>
    Array.isArray(c) ? c[0]?.name : c?.name;

  return (
    <section className={cn("w-full relative", className)}>
      {/* ✅ Tailwind로 내부 스크롤 처리 */}
      <div
        className={cn(
          "rounded-xl border-2 p-2",
          // 높이 제한 + 세로 스크롤
          "max-h-[70vh] overflow-y-auto",
          // (선택) 스크롤바 얇게 + 여백
          "pr-1"
          // tailwind-scrollbar 플러그인 사용 시 아래 클래스들도 가능
          // "scrollbar-thin scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400"
        )}
        aria-label="게시글 목록 스크롤 영역"
        role="region"
      >
        <div className="p-2">
          {loading && <GridSkeleton count={skeletonCount} />}

          {!loading && errMsg && (
            <p className="text-sm text-red-600">{errMsg}</p>
          )}

          {!loading && !errMsg && items.length === 0 && (
            <p className="text-sm text-zinc-500">아직 등록된 글이 없어요.</p>
          )}

          {!loading && !errMsg && items.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((p) => (
                <PostBox
                  key={p.id}
                  id={p.id}
                  title={p.title ?? "(제목 없음)"}
                  categoryName={pickCategoryName(p.categories) ?? "-"}
                  tags={p.tags ?? []}
                  onClick={handlePostClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
