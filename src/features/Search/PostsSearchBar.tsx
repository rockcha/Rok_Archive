// src/features/posts/PostsSearchBar.tsx
"use client";

/**
 * 🔎 PostsSearchBar (category_id 스키마 대응)
 * - Enter로 검색 실행
 * - title 또는 tag에 검색어가 "포함"되면 결과를 모아 id 배열로 콜백(onApply)
 * - 기본: 발행글(published_at not null)만, 최신순
 * - 우선순위: ①제목매치 → ②태그매치 (중복제거, 최신순 유지)
 *
 * ✅ 권장 RPC (배열 태그 부분일치 포함, category_id 사용):
 *
 * create or replace function public.search_posts_by_id(
 *   q text,
 *   p_limit int default 50,
 *   p_category_id uuid default null  -- bigint 쓰면 타입 변경
 * ) returns table(id uuid)
 * language sql as $$
 *   select p.id
 *   from posts p
 *   where p.published_at is not null
 *     and (p_category_id is null or p.category_id = p_category_id)
 *     and (
 *       p.title ilike ('%' || q || '%')
 *       or exists (
 *         select 1
 *         from unnest(coalesce(p.tags, array[]::text[])) as t(tag)
 *         where tag ilike ('%' || q || '%')
 *       )
 *     )
 *   order by p.published_at desc nulls last
 *   limit coalesce(p_limit, 50);
 * $$;
 * grant execute on function public.search_posts_by_id(text, int, uuid) to anon, authenticated;
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
  /** 카테고리 id 필터 (null/undefined면 전체) */
  categoryIdFilter?: string | number | null;
  /** 발행글만 검색 (기본 true) */
  onlyPublished?: boolean;
  /** 검색 실패 시 에러 메시지 콜백 */
  onError?: (message: string) => void;
};

export default function PostsSearchBar({
  onApply,
  placeholder = "검색어를 입력하고 Enter ⏎",
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
      // 1) 신규 권장 RPC: search_posts_by_id(q, p_limit, p_category_id)
      try {
        const { data: rpc1, error: rpc1Err } = await supabase.rpc(
          "search_posts_by_id",
          {
            q: keyword,
            p_limit: limit,
            p_category_id:
              categoryIdFilter === null || categoryIdFilter === undefined
                ? null
                : (categoryIdFilter as any),
          }
        );
        if (!rpc1Err && Array.isArray(rpc1)) {
          onApply(rpc1.map((r: any) => r.id));
          setLoading(false);
          return;
        }
      } catch {
        // 미존재/권한불가 → 조용히 폴백
      }

      // 2) 레거시 RPC(이전 함수명/시그니처 유지 중인 프로젝트 대비): search_posts(q, p_limit, p_category_id)
      try {
        const { data: rpc2, error: rpc2Err } = await supabase.rpc(
          "search_posts",
          {
            q: keyword,
            p_limit: limit,
            // 함수가 p_category(텍스트)만 받도록 만들어져 있으면 null만 전달됨
            p_category_id:
              categoryIdFilter === null || categoryIdFilter === undefined
                ? null
                : (categoryIdFilter as any),
          }
        );
        if (!rpc2Err && Array.isArray(rpc2)) {
          onApply(rpc2.map((r: any) => r.id));
          setLoading(false);
          return;
        }
      } catch {
        // 계속 폴백
      }

      // 3) 폴백: 제목 부분일치 (DB)
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

      // 4) 태그 검색 폴백
      let tagIds: string[] = [];

      // 4-a) tags가 text 컬럼인 경우 빠른 부분일치
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

        const { data: tagsTextRows, error: tagsTextErr } = await tagsTextQuery;
        if (!tagsTextErr && Array.isArray(tagsTextRows)) {
          tagIds = tagsTextRows.map((r) => r.id as string);
        }
      } catch {
        // 무시 후 4-b로 폴백
      }

      // 4-b) tags가 배열(jsonb/text[])일 수도 있으므로 상위 N개에서 클라 필터
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
          tagIds = matched.map((r) => r.id as string);
        }
      }

      // 5) 규칙 적용: 제목 매치 → 태그 매치, 중복 제거, limit
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
