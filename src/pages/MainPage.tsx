// src/pages/MainPage.tsx

import IntroCard from "@/widgets/IntroCard";
import RotatingQuotes from "@/widgets/RotatingQuotes";
import { IconCloudCard } from "@/widgets/IconCloudCard";
import CategoryBar from "@/features/posts/CategoryBar";
import { useState } from "react";
//import PostComposer from "@/features/Auth/posts/PostComposer.tsx";
import PostsBoard from "@/features/posts/PostsBoard";
export default function MainPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-12 gap-6">
      <IntroCard />
      {/* 왼쪽: 카테고리 바 */}
      <aside className="col-span-12 md:col-span-2">
        <CategoryBar selected={selected} onSelect={setSelected} />
      </aside>

      {/* 오른쪽: 글 목록 */}
      <main className="col-span-12 md:col-span-9">
        {selected ? (
          <PostsBoard category={selected} limit={12} />
        ) : (
          <div className="flex-1 pt-10 ">
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
//  return (
//     <div className="min-h-screen flex items-center ">
//
//       {/* 카테고리 섹션 */}
//       <div className="min-h-screen w-1/7 border-r-2">hello</div>

//       {/* 메인 섹션 */}
//       <div className="flex-1 pt-10 ">
//         <div className="my-8 border">
//           <PostsBoard category="react2" limit={12} />
//         </div>
//         {/* !showPosts일때 아래를 보여줌
//         */}
//       </div>
//     </div>
//   );
