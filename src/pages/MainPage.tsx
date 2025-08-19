// src/pages/MainPage.tsx

//import IntroCard from "@/widgets/IntroCard";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
import { IconCloudCard } from "@/widgets/IconCloudCard";
import AdminDock from "@/widgets/AdminDock";

import { useCallback, useMemo, useState } from "react";
import TodoList from "@/widgets/TodoList";
import SchedulePreviewAuto from "@/features/Schedule/SchedulePreviewAuto";

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
    <div className="w-full flex-col">
      <TodoList />
      <SchedulePreviewAuto />
      <div className="w-full h-[10rem] px-2 ">
        {/* 고정 툴바 (풀폭, 투명) */}
        <div className="fixed top-25 inset-x-0 z-50">
          <div className="mx-auto w-full max-w-screen-lg ">
            <section className="  p-4 flex   items-center justify-center gap-2 bg-background border">
              {/* ✅ SearchBar: 항상 가운데, 절반 크기 */}

              <div className="flex flex-col items-center  gap-2  ">
                <PostsSearchBar
                  onApply={handleApplySearch}
                  limit={50}
                  categoryIdFilter={categoryIdFilter ?? null}
                  onError={(m) => console.error(m)}
                  className="w-[25rem] min-w-[12rem]"
                />
                {/* ✅ AdminDock: SearchBar와 독립 */}
                <AdminDock />
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full  grid grid-cols-12 gap-2 ">
        {/* 왼쪽: 카테고리 */}
        <aside className="col-span-12 md:col-span-2 pl-2">
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
        <main className="col-span-12 md:col-span-10  min-w-0">
          {/* 여기부터 교체 */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_100px]  border-2 rounded-lg ">
            {/* LEFT: Posts */}
            <section className="  min-w-0 ">
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
            <aside className="border-l-2">
              <IconCloudCard />
            </aside>
          </div>
          {/* 여기까지 교체 */}
        </main>
      </div>
    </div>
  );
}
