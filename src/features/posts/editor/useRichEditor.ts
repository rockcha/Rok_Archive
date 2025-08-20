import { useEditor } from "@tiptap/react";
import type { EditorOptions } from "@tiptap/react";
import { createExtensions } from "./tiptapExtension";
import { uploadImageSupabase } from "./uploadImageSupabase";
import type { EditorView } from "@tiptap/pm/view";

function insertImageWithView(
  view: EditorView,
  attrs: { src: string; alt?: string; width?: number; height?: number }
) {
  const { state, dispatch } = view;
  const { schema, tr } = state;
  const imgNode = schema.nodes.image.create(attrs);
  // 선택 위치에 이미지 삽입
  const transaction = tr.replaceSelectionWith(imgNode).scrollIntoView();
  dispatch(transaction);
  // 디버그: 삽입 후 문서 상태 확인
  // console.log("doc after image:", view.state.doc.toJSON());
}

export function useRichEditor(options?: Partial<EditorOptions>) {
  const editor = useEditor({
    extensions: createExtensions(),
    content: "",
    editorProps: {
      attributes: {
        class: [
          "tiptap",
          "min-h-[520px]", // 최소 높이
          "max-h-[70vh]", // 최대 높이 (예: 화면 70%)
          "overflow-y-auto", // 세로 스크롤 허용
          "p-4 rounded-xl border",
          "bg-background dark:bg-zinc-900",
          "focus:outline-none",
        ].join(" "),
        autocorrect: "off",
        autocapitalize: "off",
        spellcheck: "false",
      },

      handlePaste(view, event) {
        const e = event as ClipboardEvent;
        const items = e.clipboardData?.items;
        if (!items) return false;

        const files: File[] = [];
        for (const it of items) {
          if (it.kind === "file") {
            const f = it.getAsFile();
            if (f && f.type.startsWith("image/")) files.push(f);
          }
        }
        if (files.length === 0) return false;

        e.preventDefault();

        void (async () => {
          for (const file of files) {
            try {
              const up = await uploadImageSupabase({ file, postId: "draft" });
              insertImageWithView(view, {
                src: up.url,
                alt: up.alt,
                width: up.width,
                height: up.height,
              });
            } catch (err) {
              console.error("[paste upload error]", err);
            }
          }
        })();

        return true;
      },

      handleDrop(view, event) {
        const e = event as DragEvent;
        const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;

        e.preventDefault();

        void (async () => {
          for (const file of files) {
            try {
              const up = await uploadImageSupabase({ file, postId: "draft" });
              insertImageWithView(view, {
                src: up.url,
                alt: up.alt,
                width: up.width,
                height: up.height,
              });
            } catch (err) {
              console.error("[drop upload error]", err);
            }
          }
        })();

        return true;
      },
    },
    ...options,
  });

  return editor;
}
