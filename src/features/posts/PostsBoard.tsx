// src/features/posts/PostsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import PostBox from "./PostBox";
import { useNavigate } from "react-router-dom";

// shadcn breadcrumb
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

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
  category_id: number | string | null;
  // posts → categories FK 조인이 설정되어 있다면 name만 가져와 PostBox 표시용으로 씀
  categories?: { name: string } | { name: string }[] | null;
  published_at: string | null;
};

// posts 목록용 (카테고리명은 PostBox에 보여주려고 같이 불러옴 - 선택)
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

  // ⬇️ 상단 제목용 메타: <type → category>
  const [headerMeta, setHeaderMeta] = useState<{
    type?: string;
    category?: string;
  } | null>(null);

  const navigate = useNavigate();

  const idsMode = useMemo(() => postIds !== undefined, [postIds]);
  const idsKey = useMemo(
    () => (postIds ? postIds.join("|") : "__no_ids__"),
    [postIds]
  );

  // ✅ 카테고리 id → categories → categories_type 로 두 번 조회해 header 구성
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (categoryId == null) {
        setHeaderMeta(null);
        return;
      }
      try {
        // 1) categories에서 name, type_id 조회
        const { data: cat, error: catErr } = await supabase
          .from("categories")
          .select("name, type_id")
          .eq("id", categoryId)
          .maybeSingle();

        if (catErr) throw catErr;
        if (!cat) {
          if (!cancelled) setHeaderMeta(null);
          return;
        }

        // 2) categories_type에서 type 라벨 조회
        let typeLabel: string | undefined = undefined;
        if (cat.type_id != null) {
          const { data: typeRow, error: typeErr } = await supabase
            .from("categories_type")
            .select("type")
            .eq("id", cat.type_id)
            .maybeSingle();
          if (typeErr) throw typeErr;
          typeLabel = typeRow?.type ?? undefined;
        }

        if (!cancelled) {
          setHeaderMeta({ type: typeLabel, category: cat.name ?? undefined });
        }
      } catch {
        if (!cancelled) setHeaderMeta(null); // 조용히 무시 (목록과 독립)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // ✅ posts 목록 로딩
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

          const orderMap = new Map<string, number>(
            targetIds.map((id, idx) => [id, idx] as const)
          );

          const rows = (data ?? []) as PostRow[]; // ← 한 번만 명시

          const sorted = rows
            .filter((p) => orderMap.has(p.id))
            .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

          if (!cancelled) setItems(sorted);

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
      } catch (e) {
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

  const navigateToPost = (postId: string) => navigate(`/posts/id/${postId}`);

  const pickCategoryName = (c: PostRow["categories"]) =>
    Array.isArray(c) ? c?.[0]?.name : c?.name;

  return (
    <section className={cn("w-full  mt-4", className)}>
      {/* 🧭 상단 Breadcrumb: <type → category> */}
      <div className=" pl-2 pb-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>홈</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>게시글</BreadcrumbItem>

            {headerMeta?.type && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="text-zinc-600">
                  {headerMeta.type}
                </BreadcrumbItem>
              </>
            )}

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base font-semibold">
                {headerMeta?.category ?? "전체보기"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ✅ 내부 스크롤 영역 */}
      <div
        className={cn(
          "rounded-xl border-2 p-2",
          "max-h-[70vh] overflow-y-auto",
          "pr-1"
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
                  // 상단이 특정 카테고리인 경우엔 그 이름을 공통으로 사용,
                  // 아니면 posts→categories 조인에서 온 이름을 사용
                  categoryName={
                    headerMeta?.category ??
                    pickCategoryName(p.categories) ??
                    "-"
                  }
                  tags={p.tags ?? []}
                  onClick={navigateToPost}
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
