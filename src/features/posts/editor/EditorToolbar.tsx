// src/features/posts/editor/EditorToolbar.tsx
"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { ChainedCommands } from "@tiptap/core";
import { type Selection } from "@tiptap/pm/state";

import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/shared/ui/select";

type Props = { editor: Editor | null };

/* 고정 폰트 */
const DEFAULT_FONT_FAMILY = `"Gowun Dodum", Pretendard, Inter, system-ui, -apple-system, sans-serif`;

/* 즐겨찾기 색상(흰색은 OFF/지우개 버튼 전용) */
const BULLETS = ["•", "▪", "➜", "✅", "☑️", "🔹", "🔸", "🔷", "🔶"];
const FAVORITE_HL_COLORS = [
  "#fff3a3",
  "#ffe8a3",
  "#ffd6e7",
  "#c6f7d0",
  "#d0ebff",
];

/* TipTap chain 타입 보강 */
type ChainWithExtras = ChainedCommands & {
  toggleUnderline?: () => ChainedCommands;
  setHighlight?: (opts: { color: string }) => ChainedCommands;
  extendMarkRange?: (type: string) => ChainedCommands;
};

export default function EditorToolbar({ editor }: Props) {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null); // null=OFF(지우개)
  const highlightArmed = selectedColor !== null;

  type Fmt = "bold" | "italic" | "underline" | null;
  const [activeFmt, setActiveFmt] = React.useState<Fmt>(null);
  const [bulletValue, setBulletValue] = React.useState("");

  /* 드래그 중 여부(포인터 드래그) */
  const isDraggingRef = React.useRef(false);
  /* 마지막 적용 상태 캐시(같은 선택/모드에 중복 적용 방지) */
  const lastSigRef = React.useRef<string>("");

  /* 에디터 준비 시 기본 폰트 강제 */
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

  /* --- 선택 적용/해제 로직 (공용) ---------------------------- */
  const applyHighlightOnce = React.useCallback(
    (color: string) => {
      if (!editor) return;
      const sel = editor.state.selection as Selection;
      if (sel.empty) return; // 선택 없으면 패스
      // 선택을 다시 건드리지 않고, 현재 선택에만 적용
      (editor.chain().focus() as ChainWithExtras)
        .setHighlight?.({ color })
        .run();
    },
    [editor]
  );

  const eraseHighlightOnce = React.useCallback(() => {
    if (!editor) return;
    const sel = editor.state.selection as Selection;
    if (sel.empty) {
      // 이후 입력 무색 보장
      editor.chain().focus().unsetHighlight().unsetAllMarks().run();
      return;
    }
    // 경계 포함 확실 제거(한 번만)
    (editor.chain().focus() as ChainWithExtras)
      .extendMarkRange?.("highlight")
      ?.unsetHighlight()
      .run();
  }, [editor]);

  /* --- 포인터 드래그 시작/종료 감지 → pointerup에서 1회 처리 --- */
  React.useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const onDown = () => {
      isDraggingRef.current = true;
    };
    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // 드래그가 끝난 시점에 한 번만 실행
      if (highlightArmed && selectedColor) {
        applyHighlightOnce(selectedColor);
      } else {
        eraseHighlightOnce();
      }

      // 캐시 초기화(다음 선택에 대비)
      lastSigRef.current = "";
    };

    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [
    editor,
    highlightArmed,
    selectedColor,
    applyHighlightOnce,
    eraseHighlightOnce,
  ]);

  /* --- 키보드 기반 선택(Shift+←/→ 등)을 위한 selectionUpdate 처리(디바운스) --- */
  React.useEffect(() => {
    if (!editor) return;

    let raf = 0;
    const onSelectionUpdate = () => {
      // 드래그 중엔 여기서 안 한다(깜빡임 방지)
      if (isDraggingRef.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sel = editor.state.selection as Selection;
        const sig = `${sel.from}-${sel.to}-${
          highlightArmed ? selectedColor : "OFF"
        }`;
        if (sig === lastSigRef.current) return; // 같은 상태면 스킵
        lastSigRef.current = sig;

        if (sel.empty) return;

        if (highlightArmed && selectedColor) {
          applyHighlightOnce(selectedColor);
        } else {
          eraseHighlightOnce();
        }
      });
    };

    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      cancelAnimationFrame(raf);
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [
    editor,
    highlightArmed,
    selectedColor,
    applyHighlightOnce,
    eraseHighlightOnce,
  ]);

  if (!editor) return null;

  /* 하이라이트 스와치 클릭 */
  const onClickSwatch = (color: string | null) => {
    setSelectedColor(color); // 모드 전환만, 실제 적용/해제는 pointerup 또는 selectionUpdate에서 1회 수행
    if (color === null) {
      // 즉시 지우개로 전환했을 때, 이미 드래그가 끝난 상태라면 선택이 남아 있을 수 있으니 한 번 정리
      eraseHighlightOnce();
    }
  };

  /* 글머리 기호 */
  const insertBullet = (symbol: string) => {
    editor.chain().focus().insertContent(`${symbol} `).run();
    setBulletValue("");
  };

  /* B/I/U: 상호배타 토글 (기존 유지) */
  const toggleExclusive = (fmt: Exclude<Fmt, null>) => {
    const chain = editor.chain().focus() as ChainWithExtras;

    if (activeFmt === fmt) {
      if (fmt === "bold" && editor.isActive("bold")) chain.toggleBold();
      if (fmt === "italic" && editor.isActive("italic")) chain.toggleItalic();
      if (fmt === "underline" && editor.isActive("underline"))
        chain.toggleUnderline?.();
      chain.run();
      setActiveFmt(null);
      return;
    }

    if (activeFmt === "bold" && editor.isActive("bold")) chain.toggleBold();
    if (activeFmt === "italic" && editor.isActive("italic"))
      chain.toggleItalic();
    if (activeFmt === "underline" && editor.isActive("underline"))
      chain.toggleUnderline?.();

    if (fmt === "bold" && !editor.isActive("bold")) chain.toggleBold();
    if (fmt === "italic" && !editor.isActive("italic")) chain.toggleItalic();
    if (fmt === "underline" && !editor.isActive("underline"))
      chain.toggleUnderline?.();

    chain.run();
    setActiveFmt(fmt);
  };

  /* 스타일 */
  const fmtBtnBase =
    "h-8 w-8 transition-all hover:scale-[1.04] active:scale-95 hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700";
  const fmtBtnActive =
    "bg-gray-600 text-white hover:bg-gray-600 hover:text-white";
  const fmtBtnIdle =
    "hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900";
  const swatchCls =
    "h-6 w-6 rounded border cursor-pointer transition-transform hover:scale-[1.04]";

  return (
    <div
      className="
        flex flex-nowrap items-center gap-2 rounded-md bg-background/60 p-2
        overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden
      "
      aria-label="편집 도구 막대"
    >
      {/* (1) 글머리 기호 */}
      <div role="group" aria-label="글머리 기호">
        <Select value={bulletValue} onValueChange={insertBullet}>
          <SelectTrigger size="sm" className="min-w-32">
            <SelectValue placeholder="글머리 기호" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>기호</SelectLabel>
              {BULLETS.map((b) => (
                <SelectItem key={b} value={b}>
                  <span className="font-medium">{b}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* ┇ 실제 UI 구분선: 글머리기호 / BIU / 하이라이트 */}
      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* (2) B / I / U */}
      <div
        role="group"
        aria-label="굵게, 기울임, 밑줄"
        className="flex items-center gap-2"
      >
        <Button
          size="sm"
          variant="secondary"
          className={`${fmtBtnBase} font-bold ${
            activeFmt === "bold" ? fmtBtnActive : fmtBtnIdle
          }`}
          aria-pressed={activeFmt === "bold"}
          onClick={() => toggleExclusive("bold")}
        >
          B
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className={`${fmtBtnBase} italic ${
            activeFmt === "italic" ? fmtBtnActive : fmtBtnIdle
          }`}
          aria-pressed={activeFmt === "italic"}
          onClick={() => toggleExclusive("italic")}
        >
          I
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className={`${fmtBtnBase} underline underline-offset-[3px] decoration-2 ${
            activeFmt === "underline" ? fmtBtnActive : fmtBtnIdle
          }`}
          aria-pressed={activeFmt === "underline"}
          onClick={() => toggleExclusive("underline")}
        >
          U
        </Button>
      </div>

      {/* ┇ 실제 UI 구분선: 글머리기호 / BIU / 하이라이트 */}
      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* (3) 하이라이트 즐겨찾기 */}
      <div
        role="group"
        aria-label="하이라이트"
        className="flex items-center gap-3"
      >
        {/* OFF(지우개) */}
        <button
          onClick={() => onClickSwatch(null)}
          title="하이라이트 끄기(지우개)"
          className={`${swatchCls} ${
            !highlightArmed ? "ring-2 ring-gray-400" : ""
          }`}
          style={{ background: "#ffffff" }}
          aria-pressed={!highlightArmed}
        />

        {/* 색상 스와치(hover 시 cursor-pointer 적용됨) */}
        <div className="flex items-center gap-1">
          {FAVORITE_HL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onClickSwatch(c)}
              title={c}
              className={`${swatchCls} ${
                selectedColor === c ? "ring-2 ring-gray-400" : ""
              }`}
              style={{ background: c }}
              aria-pressed={selectedColor === c}
            />
          ))}
        </div>
      </div>

      {/* (선택) 마지막 구분선 */}
      <Separator orientation="vertical" className="mx-2 h-6" />
    </div>
  );
}
