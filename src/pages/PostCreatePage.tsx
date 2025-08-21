// src/pages/posts/PostCreatePage.tsx
import PostComposer from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";
import HomeButton from "@/widgets/Header/HomeButton";

export default function PostCreatePage() {
  return (
    <div className="mx-auto w-full max-w-screen-lg bg-neutral-100 px-6 py-6">
      {/* 상단: 제목 + (오른쪽) 홈버튼(오버레이) */}
      <div className="relative w-full">
        <h1 className="text-2xl font-bold text-center">새 글 작성</h1>

        {/* 레이아웃 영향 없도록 절대배치 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2">
            {/* 필요 시 살짝 축소해서 겹침 최소화 */}
            <div className="origin-right scale-75 sm:scale-90">
              <HomeButton />
            </div>
          </div>
        </div>

        <p className="mt-1 text-md text-zinc-500 text-center">
          제목 · 카테고리 · 태그는 필수입니다.
        </p>
      </div>

      <Separator className="my-4" />
      <PostComposer />
    </div>
  );
}
