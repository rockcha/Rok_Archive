// src/features/posts/editor/tiptapExtension.ts
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import ImageWithDataAttrs from "@/features/posts/editor/imageWithDataAttrs.ts";
import { CodeBlock } from "./CodeBlock";

export function createExtensions() {
  return [
    StarterKit.configure({
      // ✅ StarterKit이 내부적으로 제공하는 동명 확장 비활성화
      link: false,
      underline: false,
      codeBlock: false,
    }),
    // 기본 폰트 강제용
    TextStyle,
    // 멀티컬러 하이라이트
    Highlight.configure({ multicolor: true }),
    // 우리가 직접 쓰는 확장만 활성화
    CodeBlock,
    Underline,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ImageWithDataAttrs.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: { class: "my-3 rounded-lg" },
    }),
  ];
}
