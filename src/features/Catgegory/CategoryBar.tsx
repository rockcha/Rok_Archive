// src/features/posts/CategoryBar.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton";
import CategoryTypeGroup from "./CategoryTypeGroup";

import { supabase } from "@/shared/lib/supabase";

type Props = {
  selected: number | null;
  onSelect: (value: number | null) => void;
  className?: string;

  showAllActive?: boolean;
  onToggleShowAll?: (v: boolean) => void;
  showAllLabel?: string;
};

type CategoryTypeRow = {
  id: number;
  type: string;
};

export default function CategoryBar({
  selected,
  onSelect,
  className,
  showAllActive = false,
  onToggleShowAll,
  showAllLabel = "# 전체보기",
}: Props) {
  const [types, setTypes] = useState<CategoryTypeRow[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // 카테고리 타입 목록 로드
  useEffect(() => {
    (async () => {
      setLoadingTypes(true);
      const { data, error } = await supabase
        .from("categories_type")
        .select("id, type")
        .order("id", { ascending: true });

      if (!error) {
        setTypes((data ?? []) as CategoryTypeRow[]);
      } else {
        setTypes([]);
      }
      setLoadingTypes(false);
    })();
  }, []);

  return (
    <nav
      className={cn(
        "relative rounded-lg  mt-2 flex flex-col gap-2",
        "h-[65vh] overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-zinc-300 hover:scrollbar-thumb-zinc-400",
        "border-2 ",
        className
      )}
      aria-label="카테고리"
    >
      {/* 전체보기 */}
      <CategoryButton
        id={null}
        label={showAllLabel}
        selected={!!showAllActive}
        isAll
        onSelectAll={() => onToggleShowAll?.(true)}
        onSelect={() => {}}
        className="shadow-md "
      />

      {/* 타입별 접이식 그룹 */}
      {loadingTypes ? (
        <div className="px-1 py-2 text-base text-zinc-500">
          타입 불러오는 중…
        </div>
      ) : types.length === 0 ? (
        <div className="px-1 py-2 text-base text-emerald-500">
          타입이 없습니다.
        </div>
      ) : (
        types.map((t) => (
          <CategoryTypeGroup
            key={t.id}
            typeId={t.id}
            typeLabel={`# ${t.type}`} // 유저에겐 문자열로 표시
            selected={selected}
            showAllActive={!!showAllActive}
            onSelectCategory={(id) => {
              onToggleShowAll?.(false);
              onSelect(id);
            }}
          />
        ))
      )}
    </nav>
  );
}
