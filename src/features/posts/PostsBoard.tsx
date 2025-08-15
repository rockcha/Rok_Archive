// src/features/posts/PostsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import PostBox from "./PostBox";

type Props = {
  /**
   * 기본 모드에서 상단 헤더에 노출할 카테고리/레이블
   * (ids 모드에서도 헤더를 쓰고 싶다면 적절한 라벨을 넣어 주세요. ex. "검색 결과")
   */
  category: string;
  /**
   * 옵션: 특정 게시글 id 목록을 외부에서 주입하면, 그 **순서대로** 렌더링합니다.
   * 값이 **정의되어 있으면 ids 모드**로 동작하고, 빈 배열([])이면 빈 결과를 표시합니다.
   * 값이 **정의되지 않은 경우** 기존처럼 category 기반으로 조회합니다.
   */
  postIds?: string[];
  /** 최대 개수 (기본 12) */
  limit?: number;
  /** 외부 래퍼 커스터마이즈 */
  className?: string;
  /** 상단 헤더 노출 여부(기본 true) */
  showHeader?: boolean;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  category_type: string | null;
  published_at: string | null;
};

export default function PostsBoard({
  category,
  postIds,
  limit = 12,
  className,
  showHeader = true,
}: Props) {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const normalized = useMemo(() => category?.trim().toLowerCase(), [category]);

  // ids 모드 여부를 명확히: "정의됐는가"로 판별 (빈 배열도 ids 모드)
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
          // ✅ ids 모드: 빈 배열이면 즉시 빈 결과
          if (!postIds || postIds.length === 0) {
            if (!cancelled) setItems([]);
            return;
          }

          // limit만큼만 자른 뒤 조회
          const limited = postIds.slice(0, Math.max(0, limit));

          const { data, error } = await supabase
            .from("posts")
            .select("id, slug, title, category_type, published_at")
            .in("id", limited)
            .not("published_at", "is", null); // 발행된 글만

          if (error) throw error;

          // Supabase .in() 응답 순서는 보장되지 않으므로, 입력된 순서대로 정렬
          const orderMap = new Map(
            limited.map((id, idx) => [id, idx] as const)
          );
          const sorted = (data ?? [])
            .filter((p) => orderMap.has(p.id))
            .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

          if (!cancelled) setItems(sorted);
        } else {
          // ✅ 기존 카테고리 모드
          const { data, error } = await supabase
            .from("posts")
            .select("id, slug, title, category_type, published_at")
            .eq("category_type", normalized)
            .not("published_at", "is", null) // 발행된 글만
            .order("published_at", { ascending: false })
            .range(0, Math.max(0, limit - 1));

          if (error) throw error;
          if (!cancelled) setItems(data ?? []);
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
  }, [idsMode, idsKey, normalized, limit]);

  // 스켈레톤 개수: ids 모드일 땐 주어진 id 개수와 limit를 고려
  const skeletonCount = useMemo(() => {
    if (idsMode)
      return Math.min(limit, postIds?.length ?? 0) || Math.min(limit, 8);
    return Math.min(limit, 8);
  }, [idsMode, postIds, limit]);

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

      {loading && <GridSkeleton count={skeletonCount} />}

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
