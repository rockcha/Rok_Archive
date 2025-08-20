// src/pages/MainPage.tsx

//import IntroCard from "@/widgets/IntroCard";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
import { IconCloudCard } from "@/widgets/IconCloudCard";

import { useCallback, useMemo, useState } from "react";
// import TodoList from "@/widgets/TodoList";
// import SchedulePreviewAuto from "@/features/Schedule/SchedulePreviewAuto";
import { CyclingHighlighter } from "@/widgets/Header/Cycling-highlighter";

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
    <div className="w-full flex-col  ">
      {/* ⬇️ 툴바 섹션: 헤더 높이만큼 sticky + 모노톤 보더 */}
      <div className="w-full ">
        <section className="relative isolate overflow-hidden bg-neutral-50 border-b-2 p-4">
          <div className="relative z-10 w-full p-4 flex items-center ">
            <p className="text-lg">
              정록이의 소소한&nbsp;&nbsp;
              <CyclingHighlighter holdMs={5000}>개발 기록소</CyclingHighlighter>
            </p>

            {/* ✅ 무조건 부모 기준 가운데 */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <PostsSearchBar
                onApply={handleApplySearch}
                limit={50}
                categoryIdFilter={categoryIdFilter ?? null}
                onError={(m) => console.error(m)}
                className="w-full sm:w-[20rem] lg:w-[25rem] 2xl:w-[30rem] max-w-full bg-background"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto w-full grid grid-cols-12 gap-2">
        {/* 왼쪽: 카테고리 */}
        <aside className="col-span-12 md:col-span-2 pl-2 mt-10">
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
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_160px] pt-12">
            {/* LEFT: Posts */}
            <section className="min-w-0">
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
