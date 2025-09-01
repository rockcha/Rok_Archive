// src/features/posts/editor/useRichEditor.ts (네가 준 파일 기반 수정)
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
  dispatch(tr.replaceSelectionWith(imgNode).scrollIntoView());
}

// 🔽 fenced code 추출 유틸
function parseFencedCode(text: string) {
  // ```lang\n...\n``` 를 가장 먼저 매칭 (멀티라인)
  const m = text.match(/^```(\w+)?\n([\s\S]*?)\n```$/m);
  if (!m) return null;
  const [, lang = "plaintext", body = ""] = m;
  return { lang, body };
}
const normalizeLang = (lang?: string) => {
  const l = (lang || "").toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    typescript: "typescript",
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    sh: "bash",
    shell: "bash",
    bash: "bash",
  };
  return map[l] || l || "plaintext";
};
export function useRichEditor(options?: Partial<EditorOptions>) {
  const editor = useEditor({
    extensions: createExtensions(),
    content: "",
    editorProps: {
      attributes: {
        class: [
          "tiptap",
          "min-h-screen",
          " box-border",
          "p-6 rounded-xl border bg-background dark:bg-zinc-900",
          "focus:outline-none",
        ].join(" "),
        autocorrect: "off",
        autocapitalize: "off",
        spellcheck: "false",
      },

      handlePaste(view, event) {
        const e = event as ClipboardEvent;

        // 1) 이미지 우선 처리 (기존 기능 유지)
        const items = e.clipboardData?.items;
        if (items) {
          const files: File[] = [];
          for (const it of items) {
            if (it.kind === "file") {
              const f = it.getAsFile();
              if (f && f.type.startsWith("image/")) files.push(f);
            }
          }
          if (files.length > 0) {
            e.preventDefault();
            (async () => {
              for (const file of files) {
                try {
                  const up = await uploadImageSupabase({
                    file,
                    postId: "draft",
                  });
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
          }
        }

        // 2) 텍스트가 fenced code 인지 확인
        const plain = e.clipboardData?.getData("text/plain") ?? "";
        const found = parseFencedCode(plain);
        if (found) {
          e.preventDefault();
          const { state, dispatch } = view;
          const { schema, tr } = state;
          const node = schema.nodes.codeBlock.create(
            { language: normalizeLang(found.lang) },
            schema.text(found.body)
          );
          dispatch(tr.replaceSelectionWith(node).scrollIntoView());
          return true;
        }

        // 기본 처리
        return false;
      },

      handleDrop(view, event) {
        const e = event as DragEvent;
        const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length === 0) return false;

        e.preventDefault();
        (async () => {
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
