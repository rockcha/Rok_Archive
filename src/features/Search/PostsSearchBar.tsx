// src/features/posts/PostsSearchBar.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Search, X } from "lucide-react";

// ✨ shine-border
import { ShineBorder } from "@/shared/magicui/shine-border";
import { useTheme } from "next-themes";

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

// ---- 작은 타입/가드들 -------------------------------------------------------
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

  // ✨ theme 기반 색상 정의
  const { theme } = useTheme();
  const shineColors =
    theme === "dark"
      ? ["#ffffff", "rgba(16,185,129,0.4)", "#9ca3af"]
      : ["#000000", "rgba(16,185,129,0.5)", "#4b5563"];

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
      // 공통 파라미터(명시적 타입으로 any 제거)
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
      } catch {
        // 미존재/권한불가 → 조용히 폴백
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
      } catch {
        // 계속 폴백
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

      // 4) 태그 검색 폴백
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

        const { data: tagsTextRows, error: tagsTextErr } = await tagsTextQuery;
        if (!tagsTextErr && Array.isArray(tagsTextRows)) {
          tagIds = tagsTextRows.filter(isIdRow).map((r) => r.id);
        }
      } catch {
        // 무시 후 4-b로 폴백
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

        const { data: tagsRows, error: tagsErr } = await tagsArrayQuery;
        if (!tagsErr && Array.isArray(tagsRows)) {
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
      className={cn("relative overflow-hidden rounded-xl", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) void runSearch(); // Enter로 검색
      }}
    >
      {/* ✨ 초록빛 ShineBorder */}
      <ShineBorder shineColor={shineColors} borderWidth={2} duration={14} />

      <div className="relative z-10 rounded-xl p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="pl-9 pr-9 bg-sky-100 focus-visible:ring-0 focus-visible:border-none focus:outline-none"
          />

          {/* 지우기 버튼 */}
          {q && (
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
              onClick={clear}
              aria-label="Clear"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
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
