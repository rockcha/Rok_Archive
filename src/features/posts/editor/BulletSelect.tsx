// src/features/posts/editor/toolbar/BulletSelect.tsx
"use client";
import * as React from "react";
import type { Editor } from "@tiptap/react";
import { BULLETS } from "./toolbarConstants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/shared/ui/select";

type Props = { editor: Editor };

export default function BulletSelect({ editor }: Props) {
  const [value, setValue] = React.useState("");

  const insertBullet = (symbol: string) => {
    editor.chain().focus().insertContent(`${symbol} `).run();
    setValue("");
  };

  return (
    <div role="group" aria-label="글머리 기호">
      <Select value={value} onValueChange={insertBullet}>
        <SelectTrigger size="sm" className="min-w-32 hover:cursor-pointer">
          <SelectValue placeholder="글머리 기호" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>기호</SelectLabel>
            {BULLETS.map((b) => (
              <SelectItem key={b} value={b} className=" hover:cursor-pointer">
                <span className="font-medium">{b}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
