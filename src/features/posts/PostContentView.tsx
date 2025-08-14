// src/features/posts/components/PostContentView.tsx
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import { createExtensions } from "./editor/tiptapExtension";
type Props = {
  contentJson?: unknown | null;
  contentMarkdown?: string | null;
};

export default function PostContentView({
  contentJson,
  contentMarkdown,
}: Props) {
  const editor = useEditor({
    extensions: createExtensions(""),
    content: (contentJson as any) ?? "",
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none min-h-[200px]",
      },
    },
  });

  // JSON이 나중에 로드되는 경우 반영
  useEffect(() => {
    if (!editor) return;
    if (contentJson) editor.commands.setContent(contentJson as any, false);
  }, [editor, contentJson]);

  // JSON이 없고 Markdown만 있을 때 간단 폴백
  if (!contentJson && contentMarkdown) {
    return (
      <pre className="whitespace-pre-wrap rounded-xl border bg-white dark:bg-zinc-900 p-4 text-sm">
        {contentMarkdown}
      </pre>
    );
  }

  return <EditorContent editor={editor} />;
}
