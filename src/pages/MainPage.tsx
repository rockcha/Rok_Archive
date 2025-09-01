// src/pages/MainPage.tsx
"use client";

import { useCallback, useMemo, useState } from "react";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
// import { IconCloudCard as IconCloudCardBase } from "@/widgets/IconCloudCard"; // 기존 named export
import AddCategoryButton from "@/features/Catgegory/AddCategoryButton";
import MusicCard from "@/features/Music/MusicCard";
import SchedulePreviewCard from "@/features/Schedule/SchedulePreviewCard";
import CreateHancomAiPostButton from "@/features/HancomAi/CreateHancomAiPostButton";

// 👇 메모된 버전으로 한번 래핑
// const IconCloudCard = memo(IconCloudCardBase);

type Mode = "selected" | "searched" | "showall";

export default function MainPage() {
  const [mode, setMode] = useState<Mode>("showall");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [searchedPostIds, setSearchedPostIds] = useState<string[]>([]);

  const handleSelectCategory = useCallback((id: number | null) => {
    setSearchedPostIds([]);
    setSelectedCategoryId(id);
    setMode(id == null ? "showall" : "selected");
  }, []);

  const handleApplySearch = useCallback((ids: string[]) => {
    setSelectedCategoryId(null);
    setSearchedPostIds(ids);
    setMode("searched");
  }, []);

  const categoryIdFilter = useMemo(
    () => (mode === "selected" ? selectedCategoryId : null),
    [mode, selectedCategoryId]
  );

  return (
    <div className="w-full flex flex-col">
      <section className="mx-auto mt-2 pt-5">
        <div className="flex">
          <PostsSearchBar
            onApply={handleApplySearch}
            limit={50}
            categoryIdFilter={categoryIdFilter ?? null}
            onError={(m) => console.error(m)}
            className="sm:w-[20rem] lg:w-[25rem] 2xl:w-[30rem] bg-background"
          />
        </div>
      </section>

      {/* ✅ 단일 3컬럼: 2fr / 5.5fr / 2.5fr */}
      <div className="mx-auto w-full grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,5.5fr)_minmax(0,2.5fr)] gap-2 flex-1">
        {/* 좌: 카테고리 (2fr) */}
        <aside className="pl-2">
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

        {/* 중간: 본문 (5.5fr) */}
        <main className="min-w-0 pl-2">
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
        </main>

        {/* 우: 뮤직/아이콘 (2.5fr) */}
        <aside className="mt-8 p-4">
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <MusicCard />
            {/* <IconCloudCard /> */}
            <SchedulePreviewCard />
            <CreateHancomAiPostButton />
          </div>
        </aside>
      </div>
    </div>
  );
}
