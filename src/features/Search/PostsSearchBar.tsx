// src/features/posts/PostsSearchBar.tsx
"use client";

/**
 * 🔎 PostsSearchBar
 * - Enter로 검색 실행
 * - title 또는 tag에 검색어가 "포함"되어 있으면 결과를 모아 id 배열로 콜백(onApply)
 * - 기본은 발행글(published_at not null)만 대상으로 최신순 정렬
 * - 우선순위: ①제목매치 → ②태그매치 (중복 제거, 최신순 유지)
 * - shadcn/ui 기반 입력 UI
 *
 * ✅ 고급(선택): tags가 text[]/jsonb[]인 경우 부분일치 지원을 위해 아래 SQL RPC를 권장합니다.
 *
 *   -- SQL (Supabase SQL Editor에서 실행)
 *   create or replace function public.search_posts(q text, p_limit int default 50, p_category text default null)
 *   returns table(id uuid)
 *   language sql as $$
 *     select p.id
 *     from posts p
 *     where (p.published_at is not null)
 *       and (p_category is null or lower(p.category_type) = lower(p_category))
 *       and (
 *         p.title ilike ('%' || q || '%')
 *         or exists (
 *           select 1
 *           from unnest(coalesce(p.tags, array[]::text[])) as t(tag)
 *           where tag ilike ('%' || q || '%')
 *         )
 *       )
 *     order by p.published_at desc nulls last
 *     limit coalesce(p_limit, 50);
 *   $$;
 *   grant execute on function public.search_posts(text, int, text) to anon, authenticated;
 */

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Loader2, Search, X } from "lucide-react";

export type PostsSearchBarProps = {
  /** 검색이 끝나면 id 배열을 넘겨줍니다 (외부에서 state로 관리). */
  onApply: (ids: string[]) => void;
  /** placeholder 커스터마이즈 */
  placeholder?: string;
  /** 결과 최대 개수 (기본 50) */
  limit?: number;
  /** 래퍼 className */
  className?: string;
  /** 자동 포커스 여부 */
  autoFocus?: boolean;
  /** 카테고리 필터 (소문자 비교). null/undefined면 전체 */
  categoryFilter?: string | null;
  /** 발행글만 검색 (기본 true) */
  onlyPublished?: boolean;
  /** 검색 실패 시 에러 메시지를 알리고 싶을 때 */
  onError?: (message: string) => void;
};

export default function PostsSearchBar({
  onApply,
  placeholder = "검색어를 입력하고 Enter ⏎",
  limit = 50,
  className,
  autoFocus,
  categoryFilter,
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
      // 1) RPC가 있으면 최우선 사용 (가장 정확/빠름)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "search_posts",
          {
            q: keyword,
            p_limit: limit,
            p_category: categoryFilter ?? null,
          }
        );

        if (!rpcError && Array.isArray(rpcData)) {
          onApply(rpcData.map((r: any) => r.id));
          setLoading(false);
          return;
        }
      } catch {
        // RPC 미존재/권한불가 시 조용히 폴백
      }

      // 2) 폴백: 제목 우선 검색 (DB에서 부분일치)
      const titleQuery = supabase
        .from("posts")
        .select("id, title, published_at, category_type, tags")
        .ilike("title", `%${keyword}%`)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (onlyPublished) titleQuery.not("published_at", "is", null);
      if (categoryFilter)
        titleQuery.eq("category_type", categoryFilter.toLowerCase());

      const { data: titleRows, error: titleErr } = await titleQuery;
      if (titleErr) throw titleErr;

      const titleIds = (titleRows ?? []).map((r) => r.id);

      // 3) 태그 검색 폴백 전략
      // - tags가 text 컬럼이면 ilike로 부분일치 시도
      // - tags가 배열(jsonb/text[]) 이면 전체 목록에서 클라측 부분일치 필터링 (상위 N=200만 조회)
      let tagIds: string[] = [];

      // 3-a) tags가 text라고 가정한 부분일치 (빠름)
      try {
        const tagsTextQuery = supabase
          .from("posts")
          .select("id, tags, published_at, category_type")
          .ilike("tags", `%${keyword}%`)
          .order("published_at", { ascending: false })
          .limit(limit);
        if (onlyPublished) tagsTextQuery.not("published_at", "is", null);
        if (categoryFilter)
          tagsTextQuery.eq("category_type", categoryFilter.toLowerCase());

        const { data: tagsTextRows, error: tagsTextErr } = await tagsTextQuery;
        if (!tagsTextErr && Array.isArray(tagsTextRows)) {
          tagIds = tagsTextRows.map((r) => r.id);
        }
      } catch {
        // 무시 후 3-b로 폴백
      }

      // 3-b) 배열 기반일 수 있으므로 상위 N개에서 클라 필터 (느리지만 안전)
      if (tagIds.length === 0) {
        const cap = Math.max(limit * 4, 200); // 적당한 안전 상한
        const tagsArrayQuery = supabase
          .from("posts")
          .select("id, tags, published_at, category_type")
          .order("published_at", { ascending: false })
          .limit(cap);
        if (onlyPublished) tagsArrayQuery.not("published_at", "is", null);
        if (categoryFilter)
          tagsArrayQuery.eq("category_type", categoryFilter.toLowerCase());

        const { data: tagsRows, error: tagsErr } = await tagsArrayQuery;
        if (!tagsErr && Array.isArray(tagsRows)) {
          const lower = keyword.toLowerCase();
          const matched = tagsRows.filter((r) => {
            const t = (r as any).tags;
            if (!t) return false;
            if (Array.isArray(t))
              return t.some((x) => String(x).toLowerCase().includes(lower));
            if (typeof t === "string") return t.toLowerCase().includes(lower);
            return false;
          });
          // 최신순은 이미 order 적용되어 있음
          tagIds = matched.map((r) => r.id);
        }
      }

      // 4) 순서 규칙: 제목 매치 먼저 → 태그 매치(중복 제거), 전체 limit
      const orderedUnique = dedupe([...titleIds, ...tagIds]).slice(0, limit);
      onApply(orderedUnique);
    } catch (e: any) {
      const msg = e?.message ?? "검색에 실패했어요.";
      onError?.(msg);
      onApply([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-background p-2",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) runSearch();
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-9 pr-9"
        />
        {q && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={clear}
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 검색 중
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" /> 검색
          </>
        )}
      </Button>
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
