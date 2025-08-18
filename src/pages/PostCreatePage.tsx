// src/pages/posts/PostCreatePage.tsx
import PostComposer from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";

export default function PostCreatePage() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-6">
      <h1 className="text-2xl font-bold">새 글 작성</h1>
      <p className="mt-1 text-sm text-zinc-500">
        제목 · 카테고리 · 태그는 필수입니다.
      </p>
      <Separator className="my-4" />
      <PostComposer />
    </div>
  );
}
