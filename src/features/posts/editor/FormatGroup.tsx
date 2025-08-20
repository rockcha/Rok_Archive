// src/features/posts/editor/toolbar/FormatGroup.tsx
"use client";
import * as React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/shared/ui/button";
import type { ChainWithExtras } from "./toolbarConstants";

type Props = { editor: Editor };

export default function FormatGroup({ editor }: Props) {
  type Fmt = "bold" | "italic" | "underline" | null;
  const [active, setActive] = React.useState<Fmt>(null);

  const toggleExclusive = (fmt: Exclude<Fmt, null>) => {
    const chain = editor.chain().focus() as ChainWithExtras;

    if (active === fmt) {
      if (fmt === "bold" && editor.isActive("bold")) chain.toggleBold();
      if (fmt === "italic" && editor.isActive("italic")) chain.toggleItalic();
      if (fmt === "underline" && editor.isActive("underline"))
        chain.toggleUnderline?.();
      chain.run();
      setActive(null);
      return;
    }

    if (active === "bold" && editor.isActive("bold")) chain.toggleBold();
    if (active === "italic" && editor.isActive("italic")) chain.toggleItalic();
    if (active === "underline" && editor.isActive("underline"))
      chain.toggleUnderline?.();

    if (fmt === "bold" && !editor.isActive("bold")) chain.toggleBold();
    if (fmt === "italic" && !editor.isActive("italic")) chain.toggleItalic();
    if (fmt === "underline" && !editor.isActive("underline"))
      chain.toggleUnderline?.();

    chain.run();
    setActive(fmt);
  };

  const base =
    "h-8 w-8 transition-all hover:scale-[1.04] active:scale-95 hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700";
  const act = "bg-neutral-500 text-white hover:bg-neutral-600 hover:text-white";
  const idle =
    "hover:bg-neutral-500 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900";

  return (
    <div
      role="group"
      aria-label="굵게, 기울임, 밑줄"
      className="flex items-center gap-2"
    >
      <Button
        size="sm"
        variant="secondary"
        className={`${base} font-bold ${
          active === "bold" ? act : idle
        } hover:cursor-pointer`}
        aria-pressed={active === "bold"}
        onClick={() => toggleExclusive("bold")}
      >
        B
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className={`${base} italic ${
          active === "italic" ? act : idle
        } hover:cursor-pointer`}
        aria-pressed={active === "italic"}
        onClick={() => toggleExclusive("italic")}
      >
        I
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className={`${base} underline underline-offset-[3px] decoration-2 ${
          active === "underline" ? act : idle
        } hover:cursor-pointer`}
        aria-pressed={active === "underline"}
        onClick={() => toggleExclusive("underline")}
      >
        U
      </Button>
    </div>
  );
}
