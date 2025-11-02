// src/pages/posts/PostCreatePage.tsx
"use client";

import { useRef, useState } from "react";
import PostComposer, {
  type PostComposerHandle,
} from "@/features/posts/PostComposer";
import { Separator } from "@/shared/ui/separator";
import HomeButton from "@/widgets/Header/HomeButton";
import FloatingMemo from "@/widgets/FloatingMemo";
import SavePostButton from "@/features/posts/editor/SavePostButton";
import { useWarnOnClose } from "@/features/posts/UseWarnOnUnload";

export default function PostCreatePage() {
  const composerRef = useRef<PostComposerHandle | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // ✅ 창 닫기/새로고침만 경고
  useWarnOnClose(isDirty);

  return (
    <div className="relative w-full">
      <h1 className="text-2xl font-bold text-center">새 글 작성</h1>
      <p className="mt-1 text-md text-zinc-500 text-center">
        제목 · 카테고리 · 태그는 필수입니다.
      </p>

      <div className="flex justify-between">
        <div className="flex gap-1">
          <HomeButton />
          <FloatingMemo />
        </div>

        <SavePostButton onClick={() => composerRef.current?.requestSave()} />
      </div>

      <Separator className="my-4" />
      {/* ✅ 작성 중 여부를 상위로 올려서 창닫기 훅에 연결 */}
      <PostComposer ref={composerRef} onDirtyChange={setIsDirty} />
    </div>
  );
}
