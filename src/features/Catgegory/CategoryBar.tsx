// src/features/posts/CategoryBar.tsx
"use client";

import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton"; // 경로는 프로젝트 구조에 맞춰 조정
import { useCategories } from "./useCategories";

type Props = {
  selected: number | null; // 선택된 카테고리 id
  onSelect: (value: number | null) => void; // 카테고리 클릭
  className?: string;

  // ✅ 추가: 전체보기 컨트롤
  showAllActive?: boolean; // 현재 전체보기 켜짐 여부
  onToggleShowAll?: (v: boolean) => void; // 전체보기 토글 콜백
  showAllLabel?: string; // 기본 "전체보기"
};

export default function CategoryBar({
  selected,
  onSelect,
  className,
  showAllActive = false,
  onToggleShowAll,
  showAllLabel = "전체보기",
}: Props) {
  const { data: categories, loading } = useCategories();

  return (
    <nav
      className={cn(
        "flex flex-col gap-2 border rounded-lg bg-background p-2 mt-10",
        className
      )}
      aria-label="카테고리"
    >
      {/* ✅ 항상 맨 위: 전체보기 버튼 */}
      <CategoryButton
        id={null}
        label={showAllLabel}
        selected={!!showAllActive}
        isAll
        onSelectAll={() => onToggleShowAll?.(true)}
        onSelect={() => {
          /* no-op (isAll이면 사용 안 함) */
        }}
      />

      {loading ? (
        <div className="px-1 py-2 text-sm text-zinc-500">
          카테고리 불러오는 중…
        </div>
      ) : categories.length ? (
        categories.map((cat) => (
          <CategoryButton
            key={String(cat.id)}
            id={cat.id}
            label={cat.name}
            selected={selected === cat.id && !showAllActive}
            onSelect={(id) => {
              onToggleShowAll?.(false); // ✅ 전체보기 끔
              onSelect(id as number);
            }}
          />
        ))
      ) : (
        <div className="px-1 py-2 text-sm text-zinc-500">
          카테고리가 없습니다.
        </div>
      )}
    </nav>
  );
}
