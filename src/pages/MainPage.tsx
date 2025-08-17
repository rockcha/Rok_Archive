// src/pages/MainPage.tsx

import IntroCard from "@/widgets/IntroCard";
// idle 모드 제거로 아래 두 개는 더 이상 사용하지 않음 → import 삭제
// import RotatingQuotes from "@/widgets/RotatingQuotes";
// import { IconCloudCard } from "@/widgets/IconCloudCard";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
import { IconCloudCard } from "@/widgets/IconCloudCard";
import RotatingQuotes from "@/widgets/RotatingQuotes";

import { useCallback, useMemo, useState } from "react";

// ✅ idle 타입 제거
type Mode = "selected" | "searched" | "showall";

export default function MainPage() {
  // ✅ 기본값을 showall 로
  const [mode, setMode] = useState<Mode>("showall");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [searchedPostIds, setSearchedPostIds] = useState<string[]>([]);

  // 카테고리 선택 → selected / (전체보기 버튼 or null) → showall
  const handleSelectCategory = useCallback((id: number | null) => {
    setSearchedPostIds([]);
    setSelectedCategoryId(id);
    setMode(id == null ? "showall" : "selected");
  }, []);

  // 검색 적용 → 결과 있으면 searched, 없으면 showall 로
  const handleApplySearch = useCallback((ids: string[]) => {
    setSelectedCategoryId(null);
    setSearchedPostIds(ids);
    setMode("searched"); // ✅ 여기! ids.length 조건 삭제
  }, []);

  // SearchBar의 category 필터는 selected 모드일 때만 적용
  const categoryIdFilter = useMemo(
    () => (mode === "selected" ? selectedCategoryId : null),
    [mode, selectedCategoryId]
  );

  return (
    <div className="grid grid-cols-12 gap-6">
      <IntroCard />

      {/* 왼쪽: 카테고리 */}
      <aside className="col-span-12 md:col-span-2">
        <CategoryBar
          selected={selectedCategoryId}
          onSelect={handleSelectCategory}
          // ✅ CategoryBar의 '전체보기' 버튼과 연동
          showAllActive={mode === "showall"}
          onToggleShowAll={(v) => {
            if (v) {
              setSelectedCategoryId(null);
              setSearchedPostIds([]);
              setMode("showall");
            }
          }}
        />
      </aside>

      {/* 오른쪽: 컨텐츠 */}
      <main className="col-span-12 md:col-span-9  min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <PostsSearchBar
            onApply={handleApplySearch}
            limit={50}
            categoryIdFilter={categoryIdFilter ?? null}
            onError={(m) => console.error(m)}
          />
        </div>

        {/* 여기부터 교체 */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* LEFT: Posts */}
          <section className="min-w-0">
            {/* 모드별 렌더링 */}
            {mode === "showall" && (
              <PostsBoard headerLabel="전체 글" showAll showHeader />
            )}

            {mode === "selected" && selectedCategoryId != null && (
              <PostsBoard
                categoryId={selectedCategoryId}
                limit={12}
                showHeader
              />
            )}

            {mode === "searched" && (
              <PostsBoard
                headerLabel="검색 결과"
                postIds={searchedPostIds}
                showHeader
              />
            )}
          </section>

          {/* RIGHT: Sidebar */}
          <aside className="lg:sticky lg:top-20 border">
            <IconCloudCard />
          </aside>
        </div>
        {/* 여기까지 교체 */}
      </main>
    </div>
  );
}
