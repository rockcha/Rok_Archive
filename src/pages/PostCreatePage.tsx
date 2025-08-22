// src/pages/posts/PostCreatePage.tsx
import PostComposer from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";

export default function PostCreatePage() {
  return (
    <div className="relative w-full">
      <h1 className="text-2xl font-bold text-center">새 글 작성</h1>
      <p className="mt-1 text-md text-zinc-500 text-center">
        제목 · 카테고리 · 태그는 필수입니다.
      </p>
      <Separator className="my-4" />
      <PostComposer />
    </div>
  );
}
