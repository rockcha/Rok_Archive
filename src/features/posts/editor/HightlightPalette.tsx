// src/features/posts/editor/toolbar/HighlightPalette.tsx
"use client";
import * as React from "react";
import type { Editor } from "@tiptap/react";
import { FAVORITE_HL_COLORS } from "./toolbarConstants";
import type { ChainWithExtras } from "./toolbarConstants";
import { type Selection } from "@tiptap/pm/state";

type Props = { editor: Editor };

export default function HighlightPalette({ editor }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null); // null = 지우개
  const armed = selected !== null;
  const isDraggingRef = React.useRef(false);
  const lastSigRef = React.useRef("");

  const applyOnce = React.useCallback(
    (color: string) => {
      const sel = editor.state.selection as Selection;
      if (sel.empty) return;
      (editor.chain().focus() as ChainWithExtras)
        .setHighlight?.({ color })
        .run();
    },
    [editor]
  );

  const eraseOnce = React.useCallback(() => {
    const sel = editor.state.selection as Selection;
    if (sel.empty) {
      editor.chain().focus().unsetHighlight().unsetAllMarks().run();
      return;
    }
    (editor.chain().focus() as ChainWithExtras)
      .extendMarkRange?.("highlight")
      ?.unsetHighlight()
      .run();
  }, [editor]);

  // pointer drag
  React.useEffect(() => {
    const dom = editor.view.dom;
    const onDown = () => {
      isDraggingRef.current = true;
    };
    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (armed && selected) applyOnce(selected);
      else eraseOnce();
      lastSigRef.current = "";
    };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [editor, armed, selected, applyOnce, eraseOnce]);

  // keyboard selection
  React.useEffect(() => {
    let raf = 0;
    const onSelectionUpdate = () => {
      if (isDraggingRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sel = editor.state.selection as Selection;
        const sig = `${sel.from}-${sel.to}-${armed ? selected : "OFF"}`;
        if (sig === lastSigRef.current) return;
        lastSigRef.current = sig;
        if (sel.empty) return;
        if (armed && selected) applyOnce(selected);
        else eraseOnce();
      });
    };
    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor, armed, selected, applyOnce, eraseOnce]);

  const swatchCls =
    "h-6 w-6 rounded border cursor-pointer transition-transform hover:scale-[1.04]";

  return (
    <div
      role="group"
      aria-label="하이라이트"
      className="flex items-center gap-3"
    >
      {/* 지우개 */}
      <button
        onClick={() => {
          setSelected(null);
          eraseOnce();
        }}
        title="하이라이트 끄기(지우개)"
        className={`${swatchCls} ${!armed ? "ring-2 ring-gray-400" : ""}`}
        style={{ background: "#ffffff" }}
        aria-pressed={!armed}
      />
      {/* 팔레트 */}
      <div className="flex items-center gap-1">
        {FAVORITE_HL_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            title={c}
            className={`${swatchCls} ${
              selected === c ? "ring-2 ring-gray-400" : ""
            }`}
            style={{ background: c }}
            aria-pressed={selected === c}
          />
        ))}
      </div>
    </div>
  );
}
