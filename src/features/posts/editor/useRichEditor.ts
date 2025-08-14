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
          "min-h-[320px] p-4 rounded-xl border bg-white dark:bg-zinc-900 focus:outline-none",
      },
    },
    ...options,
  });

  return editor;
}
