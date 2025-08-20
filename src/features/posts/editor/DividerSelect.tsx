// src/features/posts/editor/toolbar/DividerSelect.tsx
"use client";
import * as React from "react";
import type { Editor } from "@tiptap/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/shared/ui/select";
import { LINE_SOLID, LINE_DOTTED, LINE_EMOJI } from "./toolbarConstants";
import type { DividerKind } from "./toolbarConstants";

type Props = { editor: Editor };

export default function DividerSelect({ editor }: Props) {
  const [value, setValue] = React.useState<DividerKind | "">("");

  const insertDivider = React.useCallback(
    (kind: DividerKind) => {
      let line = "";
      if (kind === "solid") line = LINE_SOLID;
      if (kind === "dotted") line = LINE_DOTTED;
      if (kind === "emoji") line = LINE_EMOJI;

      editor
        .chain()
        .focus()
        .splitBlock()
        .insertContent({
          type: "paragraph",
          content: [{ type: "text", text: line }],
        })
        .insertContent({ type: "paragraph" })
        .run();

      const end = editor.state.doc.content.size;
      editor.commands.setTextSelection(end);
      editor.commands.scrollIntoView();
      setValue(""); // 같은 옵션 재선택 가능
    },
    [editor]
  );

  return (
    <div role="group" aria-label="구분선">
      <Select
        value={value}
        onValueChange={(v) => insertDivider(v as DividerKind)}
      >
        <SelectTrigger size="sm" className="min-w-40 hover:cursor-pointer">
          <SelectValue placeholder="구분선 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>구분선</SelectLabel>
            <SelectItem value="solid" className="hover:cursor-pointer">
              기본 실선
            </SelectItem>
            <SelectItem value="dotted" className="hover:cursor-pointer">
              점선
            </SelectItem>
            <SelectItem value="emoji" className="hover:cursor-pointer">
              귀여운
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
