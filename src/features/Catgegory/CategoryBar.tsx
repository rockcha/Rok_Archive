// src/features/posts/CategoryBar.tsx
"use client";

import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton"; // 경로는 프로젝트 구조에 맞춰 조정
import { useCategories } from "./useCategories";

// ✨ 추가
import { ShineBorder } from "@/shared/magicui/shine-border";
import { useTheme } from "next-themes";

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

  // ✨ 모노톤 컬러(라이트=검정계열, 다크=흰계열)
  const { theme } = useTheme();
  const monoColors =
    theme === "dark"
      ? ["#ffffff", "rgba(16,185,129,0.28)", "rgba(16,185,129,0.18)", "#9ca3af"]
      : [
          "#000000",
          "rgba(16,185,129,0.35)",
          "rgba(16,185,129,0.22)",
          "#4b5563",
        ];

  return (
    <nav
      className={cn(
        // 기존: "flex flex-col gap-2 border rounded-lg bg-background p-2 mt-2"
        // ⬇️ ShineBorder를 쓰기 위해 border 제거 + position 설정
        "relative overflow-hidden rounded-lg bg-background p-2 mt-2 flex flex-col gap-2",
        className
      )}
      aria-label="카테고리"
    >
      {/* ✨ 모노톤 ShineBorder */}
      <ShineBorder shineColor={monoColors} borderWidth={2} duration={14} />

      {/* 실제 콘텐츠는 z-10로 올려서 인터랙션 유지 */}
      <div className="relative z-10 flex flex-col gap-2">
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
      </div>
    </nav>
  );
}
