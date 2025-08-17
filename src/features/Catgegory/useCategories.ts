// src/features/posts/hooks/useCategories.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";

export type Category = {
  id: number;
  name: string;
};

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!mounted) return;
      if (error) setError(new Error(error.message));
      else setData((data ?? []) as Category[]);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
