// src/features/posts/editor/EditorToolbar.tsx
"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { DEFAULT_FONT_FAMILY } from "./toolbarConstants";
import DividerSelect from "./DividerSelect";
import BulletSelect from "./BulletSelect";
import FormatGroup from "./FormatGroup";
import HighlightPalette from "./HightlightPalette";
import ToolbarDivider from "./ToolbarDivider";
import InsertCodeModal from "./InsertCodeModal";

type Props = { editor: Editor | null };

export default function EditorToolbar({ editor }: Props) {
  React.useEffect(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    editor
      .chain()
      .focus()
      .selectAll()
      .setMark("textStyle", { fontFamily: DEFAULT_FONT_FAMILY })
      .setTextSelection({ from, to })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="sticky top-[100px] z-40 border rounded-lg bg-background p-2">
      {" "}
      <div
        className="
        flex flex-nowrap items-center gap-2 rounded-md bg-background/60 p-2
        overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
      "
        aria-label="편집 도구 막대"
      >
        <DividerSelect editor={editor} />
        <ToolbarDivider tall />
        <BulletSelect editor={editor} />
        <ToolbarDivider tall />
        <FormatGroup editor={editor} />
        <ToolbarDivider tall />
        <HighlightPalette editor={editor} />
        <ToolbarDivider tall />
        <InsertCodeModal editor={editor} />
      </div>
    </div>
  );
}
