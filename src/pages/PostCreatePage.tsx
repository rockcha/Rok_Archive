// src/pages/posts/PostCreatePage.tsx
import PostComposer from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";

export default function PostCreatePage() {
  return (
    <div className="mx-auto w-full max-w-screen-lg bg-neutral-100 px-6 py-6">
      {/* 상단: 제목 + (오른쪽) 홈버튼(오버레이) */}
      <div className="relative w-full">
        <h1 className="text-2xl font-bold text-center">새 글 작성</h1>

        {/* 레이아웃 영향 없도록 절대배치 */}
        <div className="pointer-events-none absolute inset-0"></div>

        <p className="mt-1 text-md text-zinc-500 text-center">
          제목 · 카테고리 · 태그는 필수입니다.
        </p>
      </div>

      <Separator className="my-4" />
      <PostComposer />
    </div>
  );
}
