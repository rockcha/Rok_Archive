// src/pages/MainPage.tsx
"use client";

import { useCallback, useMemo, useState } from "react";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
import { IconCloudCard } from "@/widgets/IconCloudCard";

import AddCategoryButton from "@/features/Catgegory/AddCategoryButton";

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
    setMode("searched"); // ✅ ids.length 조건 삭제
  }, []);

  // SearchBar의 category 필터는 selected 모드일 때만 적용
  const categoryIdFilter = useMemo(
    () => (mode === "selected" ? selectedCategoryId : null),
    [mode, selectedCategoryId]
  );

  return (
    // ✅ 내용물과 무관하게 뷰포트에 가리지 않도록 최소 높이 고정
    <div className="w-full flex flex-col min-h-[100svh]">
      {/* ⬇️ 툴바 섹션: 고정 높이(내용과 무관) + 중앙에 검색바 */}
      <section className=" mx-auto h-16 sm:h-20 pt-5">
        <PostsSearchBar
          onApply={handleApplySearch}
          limit={50}
          categoryIdFilter={categoryIdFilter ?? null}
          onError={(m) => console.error(m)}
          className=" sm:w-[20rem] lg:w-[25rem] 2xl:w-[30rem]  bg-background"
        />
      </section>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto w-full grid grid-cols-12 gap-2 flex-1 ">
        {/* 왼쪽: 카테고리 */}
        <aside className="col-span-12 md:col-span-2 pl-2 ">
          <div className="flex justify-end mt-2 pt-2">
            <AddCategoryButton />
          </div>

          <CategoryBar
            selected={selectedCategoryId}
            onSelect={handleSelectCategory}
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
        <main className="col-span-12 md:col-span-10 min-w-0 pl-2">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px] p-2">
            {/* LEFT: Posts */}
            <section>
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
            <aside>
              <IconCloudCard />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
