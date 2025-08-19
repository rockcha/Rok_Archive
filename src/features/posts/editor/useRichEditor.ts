// src/features/posts/editor/useRichEditor.ts
import { useEditor } from "@tiptap/react";
import type { EditorOptions } from "@tiptap/react";
import { createExtensions } from "./tiptapExtension";

export function useRichEditor(options?: Partial<EditorOptions>) {
  const editor = useEditor({
    extensions: createExtensions(),
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[520px] p-4 rounded-xl border bg-background dark:bg-zinc-900 focus:outline-none",
        autocorrect: "off", // iOS 자동 교정 끄기
        autocapitalize: "off", // 첫글자 자동 대문자 끄기
        spellcheck: "false", // 맞춤법 검사 끄기
      },
    },
    ...options,
  });

  return editor;
}
