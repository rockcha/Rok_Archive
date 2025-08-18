// src/features/posts/editor/tiptapExtension.ts
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";

export function createExtensions() {
  return [
    StarterKit.configure({}),
    // ✅ 기본 폰트(Gowun Dodum) 강제 적용용 마크만 유지
    TextStyle,
    Highlight.configure({ multicolor: true }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
  ];
}
