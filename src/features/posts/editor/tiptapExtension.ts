// src/features/posts/editor/tiptapExtension.ts
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import Link from "@tiptap/extension-link";

export function createExtensions() {
  return [
    StarterKit.configure({}),
    TextStyle, // fontSize 등 인라인 스타일의 기반
    FontFamily, // editor.chain().setFontFamily("...") 커맨드 제공
    Color.configure({ types: [TextStyle.name, ListItem.name] }), // or ['textStyle','listItem']
    Highlight.configure({ multicolor: true }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
  ];
}
