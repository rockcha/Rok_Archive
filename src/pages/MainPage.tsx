// src/pages/MainPage.tsx

import IntroCard from "@/widgets/IntroCard";
import RotatingQuotes from "@/widgets/RotatingQuotes";
import { IconCloudCard } from "@/widgets/IconCloudCard";
import CategoryBar from "@/features/posts/CategoryBar";
import PostsSearchBar from "@/features/Search/PostsSearchBar";
import { useState } from "react";

import PostsBoard from "@/features/posts/PostsBoard";

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchedCategoryIds, setSearchedCategoryIds] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <IntroCard />
      {/* 왼쪽: 카테고리 바 */}
      <aside className="col-span-12 md:col-span-2">
        <CategoryBar
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </aside>

      {/* 오른쪽: 글 목록 */}
      <main className="col-span-12 md:col-span-9">
        <PostsSearchBar
          onApply={setSearchedCategoryIds} // 검색 결과 id 배열을 외부 state로 set
          limit={50} // 최대 결과 수
          categoryFilter={null} // 특정 카테고리만 검색하고 싶으면 "react" 처럼 소문자로
          onError={(m) => console.error(m)}
        />
        {selectedCategory ? (
          <PostsBoard category={selectedCategory} limit={12} />
        ) : (
          <div className="flex-1 pt-10 ">
            <PostsBoard
              category="검색 결과"
              postIds={searchedCategoryIds}
              showHeader
            />
            <RotatingQuotes />
            <div className="flex justify-center">
              <IconCloudCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
