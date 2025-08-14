// src/features/posts/components/PostContentView.tsx
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { createExtensions } from "./editor/tiptapExtension";

type Props = {
  contentJson?: JSONContent | string | null; // 서버에서 string으로 올 수도 있어 안전하게
  contentMarkdown?: string | null;
};

export default function PostContentView({
  contentJson,
  contentMarkdown,
}: Props) {
  // string 이면 먼저 파싱
  const parsedJson: JSONContent | null =
    typeof contentJson === "string"
      ? (JSON.parse(contentJson) as JSONContent)
      : contentJson ?? null;

  const editor = useEditor({
    extensions: createExtensions(""),
    content: parsedJson ?? "", // 초기 컨텐츠
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none min-h-[200px]",
        spellcheck: "false", // 코드 붙여넣기 빨간 줄 방지
      },
    },
  });

  // JSON이 나중에 도착했을 때 반영
  useEffect(() => {
    if (!editor || !parsedJson) return;
    editor.commands.setContent(parsedJson, {
      emitUpdate: false, // ✅ false 대신 옵션 객체
    });
  }, [editor, parsedJson]);

  // JSON이 없고 Markdown만 있을 때 간단 폴백
  if (!parsedJson && contentMarkdown) {
    return (
      <pre className="whitespace-pre-wrap rounded-xl border bg-white dark:bg-zinc-900 p-4 text-sm">
        {contentMarkdown}
      </pre>
    );
  }

  return <EditorContent editor={editor} />;
}
