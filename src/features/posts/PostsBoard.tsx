// src/features/posts/PostsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import PostBox from "./PostBox";
import { useNavigate } from "react-router-dom";

type Props = {
  headerLabel?: string;
  postIds?: string[]; // 정의되면 ids 모드
  categoryId?: number | null; // 카테고리 필터
  limit?: number; // 기본 12
  className?: string;
  showHeader?: boolean;
  showAll?: boolean; // ✅ 전체 보기 (외부 제어)
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
  headerLabel,
  postIds,
  categoryId = null,
  limit = 12,
  className,
  showHeader = true,
  showAll = false, // ✅ 기본은 꺼짐
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
          // ✅ ids 모드
          if (!postIds || postIds.length === 0) {
            if (!cancelled) setItems([]);
            return;
          }

          const targetIds = showAll
            ? postIds // 전체 사용
            : postIds.slice(0, Math.max(0, limit)); // limit만큼

          const { data, error } = await supabase
            .from("posts")
            .select(FIELDS)
            .in("id", targetIds)
            .not("published_at", "is", null);

          if (error) throw error;

          // 입력 순서 유지
          const orderMap = new Map(
            targetIds.map((id, idx) => [id, idx] as const)
          );
          const sorted = (data ?? [])
            .filter((p) => orderMap.has(p.id))
            .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

          if (!cancelled) setItems(sorted as PostRow[]);
        } else {
          // ✅ 카테고리 모드 (showAll 지원)
          let base = supabase
            .from("posts")
            .select(FIELDS)
            .not("published_at", "is", null)
            .order("published_at", { ascending: false });

          if (categoryId !== null && categoryId !== undefined) {
            base = base.eq("category_id", categoryId);
          }

          if (showAll) {
            // 페이지네이션으로 전체 수집
            const PAGE = 100; // 페이지 크기(상황에 맞게 조절)
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

              if (!chunk.length || chunk.length < PAGE) break; // 마지막 페이지
              offset += PAGE;
            }

            if (!cancelled) setItems(acc);
          } else {
            // 기존: limit만큼
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
  }, [idsMode, idsKey, categoryId, limit, showAll]); // ✅ showAll 의존성 추가

  // 스켈레톤 개수 (대략)
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
    <section className={cn("w-full", className)}>
      {showHeader && (
        <div className="mb-3 flex items-end justify-start gap-3 ">
          <h3 className="text-2xl font-semibold pl-4 text-zinc-900 dark:text-zinc-100 ">
            {headerLabel ??
              (categoryId
                ? pickCategoryName(items[0]?.categories)
                : showAll
                ? "전체 글"
                : "전체 글")}
          </h3>
          <span className="text-xs  text-zinc-500">{items.length} posts</span>
        </div>
      )}

      {loading && <GridSkeleton count={skeletonCount} />}

      {!loading && errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

      {!loading && !errMsg && items.length === 0 && (
        <p className="text-sm text-zinc-500">아직 등록된 글이 없어요.</p>
      )}

      {!loading && !errMsg && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
    </section>
  );
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-xl border bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
