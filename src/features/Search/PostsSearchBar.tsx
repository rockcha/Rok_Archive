// src/features/posts/PostsSearchBar.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";

export type PostsSearchBarProps = {
  onApply: (ids: string[]) => void;
  placeholder?: string;
  limit?: number;
  className?: string;
  autoFocus?: boolean;
  categoryIdFilter?: string | number | null;
  onlyPublished?: boolean;
  onError?: (message: string) => void;
};

type IdRow = { id: string };
const isIdRow = (x: unknown): x is IdRow =>
  typeof x === "object" &&
  x !== null &&
  typeof (x as Record<string, unknown>).id === "string";

type TagsRow = { id: string; tags: unknown };
const matchTag = (tags: unknown, lower: string): boolean => {
  if (Array.isArray(tags))
    return tags.some((t) => String(t).toLowerCase().includes(lower));
  if (typeof tags === "string") return tags.toLowerCase().includes(lower);
  return false;
};

export default function PostsSearchBar({
  onApply,
  placeholder = "제목이나 태그를 입력하세요",
  limit = 50,
  className,
  autoFocus,
  categoryIdFilter,
  onlyPublished = true,
  onError,
}: PostsSearchBarProps) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setQ("");
    onApply([]);
  };

  const runSearch = async () => {
    const keyword = q.trim();
    if (!keyword) {
      onApply([]);
      return;
    }

    setLoading(true);
    try {
      const pCategoryId: string | number | null =
        categoryIdFilter == null
          ? null
          : typeof categoryIdFilter === "string" ||
            typeof categoryIdFilter === "number"
          ? categoryIdFilter
          : null;

      // 1) 신규 권장 RPC
      try {
        const { data: rpc1, error: rpc1Err } = await supabase.rpc(
          "search_posts_by_id",
          {
            q: keyword,
            p_limit: limit,
            p_category_id: pCategoryId,
          }
        );
        if (!rpc1Err && Array.isArray(rpc1) && rpc1.every(isIdRow)) {
          onApply(rpc1.map((r) => r.id));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.debug("search_posts_by_id RPC fallback:", err);
      }

      // 2) 레거시 RPC
      try {
        const { data: rpc2, error: rpc2Err } = await supabase.rpc(
          "search_posts",
          {
            q: keyword,
            p_limit: limit,
            p_category_id: pCategoryId,
          }
        );
        if (!rpc2Err && Array.isArray(rpc2) && rpc2.every(isIdRow)) {
          onApply(rpc2.map((r) => r.id));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.debug("search_posts RPC fallback:", err);
      }

      // 3) 제목 부분일치
      const titleQuery = supabase
        .from("posts")
        .select("id, title, tags, published_at, category_id")
        .ilike("title", `%${keyword}%`)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (onlyPublished) titleQuery.not("published_at", "is", null);
      if (categoryIdFilter !== null && categoryIdFilter !== undefined)
        titleQuery.eq("category_id", categoryIdFilter);

      const { data: titleRows, error: titleErr } = await titleQuery;
      if (titleErr) throw titleErr;

      const titleIds = (titleRows ?? []).map((r) => r.id as string);

      // 4) 태그 검색
      let tagIds: string[] = [];
      // 4-a) tags가 text 컬럼인 경우
      try {
        const tagsTextQuery = supabase
          .from("posts")
          .select("id, tags, published_at, category_id")
          .ilike("tags", `%${keyword}%`)
          .order("published_at", { ascending: false })
          .limit(limit);

        if (onlyPublished) tagsTextQuery.not("published_at", "is", null);
        if (categoryIdFilter !== null && categoryIdFilter !== undefined)
          tagsTextQuery.eq("category_id", categoryIdFilter);

        const { data: tagsTextRows } = await tagsTextQuery;
        if (Array.isArray(tagsTextRows)) {
          tagIds = tagsTextRows.filter(isIdRow).map((r) => r.id);
        }
      } catch (err) {
        console.debug("tags text fallback to array:", err);
      }

      // 4-b) tags가 배열(jsonb/text[])일 수도
      if (tagIds.length === 0) {
        const cap = Math.max(limit * 4, 200);
        const tagsArrayQuery = supabase
          .from("posts")
          .select("id, tags, published_at, category_id")
          .order("published_at", { ascending: false })
          .limit(cap);

        if (onlyPublished) tagsArrayQuery.not("published_at", "is", null);
        if (categoryIdFilter !== null && categoryIdFilter !== undefined)
          tagsArrayQuery.eq("category_id", categoryIdFilter);

        const { data: tagsRows } = await tagsArrayQuery;
        if (Array.isArray(tagsRows)) {
          const lower = keyword.toLowerCase();
          const rows = tagsRows as ReadonlyArray<TagsRow>;
          tagIds = rows.filter((r) => matchTag(r.tags, lower)).map((r) => r.id);
        }
      }

      // 5) 제목 우선 → 태그, 중복 제거 후 limit
      const orderedUnique = dedupe([...titleIds, ...tagIds]).slice(0, limit);
      onApply(orderedUnique);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "검색에 실패했어요.";
      onError?.(msg);
      onApply([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) void runSearch();
      }}
    >
      {/* 입력부 + 우측 검색 버튼 */}
      <div className="flex items-stretch ">
        {/* 입력부: 두꺼운 초록 테두리 */}
        <div className="relative flex-1   border-y-3 border-l-3 border-neutral-500">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="h-13 px-4 pr-12 border-0 focus-visible:ring-0 focus-visible:border-0 focus:outline-none bg-white"
            />

            {/* 지우기 버튼 */}
            {q && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                onClick={clear}
                aria-label="Clear"
                disabled={loading}
              >
                <X className="h-5 w-5 hover:cursor-pointer" />
              </button>
            )}
          </div>
        </div>

        {/* 검색 버튼: 돋보기 아이콘 */}
        <button
          type="submit"
          className="h-15 w-15 shrink-0  bg-neutral-500 hover:bg-neutral-600 text-white grid place-items-center cursor-pointer"
          disabled={loading}
          aria-label="검색"
          title="검색"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}
