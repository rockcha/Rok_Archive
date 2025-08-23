// src/pages/MainPage.tsx
"use client";

import { useCallback, useMemo, useState, memo } from "react";

import CategoryBar from "@/features/Catgegory/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import PostsBoard from "@/features/posts/PostsBoard";
import { IconCloudCard as IconCloudCardBase } from "@/widgets/IconCloudCard"; // 기존 named export
import AddCategoryButton from "@/features/Catgegory/AddCategoryButton";

// 👇 메모된 버전으로 한번 래핑
const IconCloudCard = memo(IconCloudCardBase);

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
    <div className="w-full flex flex-col min-h-[100svh]">
      <section className="mx-auto h-16 sm:h-20 pt-5">
        <PostsSearchBar
          onApply={handleApplySearch}
          limit={50}
          categoryIdFilter={categoryIdFilter ?? null}
          onError={(m) => console.error(m)}
          className="sm:w-[20rem] lg:w-[25rem] 2xl:w-[30rem] bg-background"
        />
      </section>

      <div className="mx-auto w-full grid grid-cols-12 gap-2 flex-1">
        <aside className="col-span-12 md:col-span-2 pl-2">
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

        <main className="col-span-12 md:col-span-10 min-w-0 pl-2">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px] p-2">
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

            {/* 👉 메모된 컴포넌트 사용 */}
            <aside>
              <IconCloudCard />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
