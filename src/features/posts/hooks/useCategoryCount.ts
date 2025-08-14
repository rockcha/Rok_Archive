// src/features/posts/hooks/useCategoryCount.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";

type CacheEntry = { count: number; fetchedAt: number };
const CACHE = new Map<string, CacheEntry>();
const IN_FLIGHT = new Map<string, Promise<number>>();
const TTL = 5 * 60 * 1000; // 5분

async function fetchCount(category: string): Promise<number> {
  const key = category.trim().toLowerCase();
  // 캐시 유효
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.fetchedAt < TTL) return hit.count;
  // 진행 중 요청 공유
  const inflight = IN_FLIGHT.get(key);
  if (inflight) return inflight;

  const p = (async () => {
    const { count, error } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("category_type", key)
      .not("published_at", "is", null);

    if (error) throw error;
    const c = count ?? 0;
    CACHE.set(key, { count: c, fetchedAt: Date.now() });
    IN_FLIGHT.delete(key);
    return c;
  })();

  IN_FLIGHT.set(key, p);
  return p;
}

// 여러 개 미리 로드(옵션)
export async function prefetchCategoryCounts(categories: string[]) {
  await Promise.all(categories.map((c) => fetchCount(c)));
}

export function useCategoryCount(category: string) {
  const key = category.trim().toLowerCase();
  const [count, setCount] = useState<number>(() => CACHE.get(key)?.count ?? 0);
  const [loading, setLoading] = useState<boolean>(() => !CACHE.get(key));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(!CACHE.get(key));
    setError(null);

    fetchCount(key)
      .then((c) => alive && setCount(c))
      .catch((e) => alive && setError(e?.message ?? "count error"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [key]);

  return {
    count,
    loading,
    error,
    refresh: () => fetchCount(key).then(setCount),
  };
}
export default useCategoryCount;
