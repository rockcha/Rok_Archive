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

// 기본값
const DEFAULT_FONT_SIZE = "14px";
const DEFAULT_FONT_FAMILY = `"Gowun Dodum", Pretendard, Inter, system-ui, -apple-system, sans-serif`;

// 특이/귀여운 폰트만
const CUTE_FONTS = [
  { label: "Gowun Dodum (기본)", value: DEFAULT_FONT_FAMILY },
  { label: "Jua", value: `"Jua", ${DEFAULT_FONT_FAMILY}` },
  {
    label: "Nanum Pen Script",
    value: `"Nanum Pen Script", ${DEFAULT_FONT_FAMILY}`,
  },
  {
    label: "Black Han Sans",
    value: `"Black Han Sans", ${DEFAULT_FONT_FAMILY}`,
  },
  { label: "다시시작해", value: `"Dasi Sijakhae", ${DEFAULT_FONT_FAMILY}` },
];

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
];
const BULLETS = ["•", "▪", "➜", "✅", "☑️", "⭐", "👉", "🔹", "🔸", "🔷", "🔶"];
const FAVORITE_HL_COLORS = [
  "#fff3a3",
  "#ffe8a3",
  "#ffd6e7",
  "#c6f7d0",
  "#d0ebff",
];

/** 확장 커맨드 보강 타입 */
type ChainWithExtras = ChainedCommands & {
  toggleUnderline?: () => ChainedCommands;
  setHighlight?: (opts: { color: string }) => ChainedCommands;
};

/** 노드 선택이면 텍스트 선택으로 바꿔 마크가 확실히 적용되게 */
function applyWithTextSelection(
  editor: Editor,
  apply: (chain: ChainWithExtras) => void
) {
  const sel = editor.state.selection as Selection;
  const chain = editor.chain().focus() as ChainWithExtras;

  if (!sel.empty) {
    // NodeSelection이든 TextSelection이든 동일하게 from~to로 텍스트 셀렉션 지정
    chain.setTextSelection({ from: sel.from, to: sel.to });
  }
  apply(chain);
  chain.run();
}

export default function EditorToolbar({ editor }: Props) {
  // 훅은 항상 호출되어야 함(조건문 밖)
  const [fontSize, setFontSize] = React.useState(DEFAULT_FONT_SIZE);
  const [fontFamily, setFontFamily] = React.useState(DEFAULT_FONT_FAMILY);
  const [bulletValue, setBulletValue] = React.useState("");

  // 하이라이트 상태
  const [hlColor, setHlColor] = React.useState("#fff3a3"); // 피커 값
  const [currentHl, setCurrentHl] = React.useState<string | null>(null);

  type Fmt = "bold" | "italic" | "underline" | null;
  const [activeFmt, setActiveFmt] = React.useState<Fmt>(null);

  // 에디터가 준비되면 기본 폰트/크기 적용
  React.useEffect(() => {
    if (!editor) return;
    applyWithTextSelection(editor, (ch) =>
      ch.setMark("textStyle", { fontFamily })
    );
    applyWithTextSelection(editor, (ch) =>
      ch.setMark("textStyle", { fontSize })
    );
  }, [editor]); // 최초 1회

  // 선택/트랜잭션 변경 시 현재 하이라이트 반영
  React.useEffect(() => {
    if (!editor) return;
    const update = () => {
      if (editor.isActive("highlight")) {
        const c =
          (editor.getAttributes("highlight")?.color as string | undefined) ??
          null;
        setCurrentHl(c);
      } else {
        setCurrentHl(null);
      }
    };
    update();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // editor가 아직 없으면 빈 툴바(훅은 이미 호출됨)
  if (!editor) return null;

  // 글자 크기/글꼴
  const applyFontSize = (size: string) => {
    setFontSize(size);
    applyWithTextSelection(editor, (ch) =>
      ch.setMark("textStyle", { fontSize: size })
    );
  };
  const applyFontFamily = (ff: string) => {
    setFontFamily(ff);
    // setFontFamily 커맨드 대신 textStyle로 적용(타입 안전)
    applyWithTextSelection(editor, (ch) =>
      ch.setMark("textStyle", { fontFamily: ff })
    );
  };

  // 하이라이트
  const setHighlightColor = (color: string | null) => {
    if (color == null) {
      editor.chain().focus().unsetHighlight().run();
      return;
    }
    setHlColor(color);
    applyWithTextSelection(editor, (ch) =>
      (ch as ChainWithExtras).setHighlight?.({ color })
    );
  };

  // 글머리 기호
  const insertBullet = (symbol: string) => {
    editor.chain().focus().insertContent(`${symbol} `).run();
    setBulletValue("");
  };

  // B/I/U: 상호배타 토글

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

  const fmtBtnBase =
    "h-8 w-8 transition-all hover:scale-[1.04] active:scale-95 hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700";
  const fmtBtnActive =
    "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white";
  const fmtBtnIdle =
    "hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900";

  return (
    <div
      className="
      flex flex-nowrap items-center gap-2 rounded-md bg-background/60 p-2
      overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]
      [&::-webkit-scrollbar]:hidden
    "
    >
      {/* B / I / U (exclusive) */}
      <div className="flex items-center gap-2">
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

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 글자 크기 */}
      <Select value={fontSize} onValueChange={applyFontSize}>
        <SelectTrigger size="sm" className="min-w-28">
          <SelectValue placeholder="글자 크기" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>글자 크기</SelectLabel>
            {FONT_SIZES.map((sz) => (
              <SelectItem key={sz} value={sz}>
                {sz}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 글꼴 */}
      <Select value={fontFamily} onValueChange={applyFontFamily}>
        <SelectTrigger size="sm" className="min-w-44">
          <SelectValue placeholder="글꼴" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>글꼴</SelectLabel>
            {CUTE_FONTS.map((f) => (
              <SelectItem key={f.label} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 하이라이트: 없음 + 즐겨찾기 + 피커 + 상태표시 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setHighlightColor(null)}
          title="하이라이트 없음"
          className={`h-6 w-6 rounded border ${
            currentHl == null ? "ring-2 ring-emerald-200" : ""
          }`}
          style={{ background: "#ffffff" }}
        />
        <div className="flex items-center gap-1">
          {FAVORITE_HL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setHighlightColor(c)}
              title={c}
              className={`h-6 w-6 rounded border ${
                currentHl === c ? "ring-2 ring-emerald-200" : ""
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="ml-1 flex items-center gap-2 text-sm">
          하이라이트
          <input
            type="color"
            value={hlColor}
            onChange={(e) => setHighlightColor(e.target.value)}
            className={`h-8 w-8 cursor-pointer rounded border ${
              currentHl ? "ring-2 ring-emerald-200" : ""
            }`}
            title="색을 고르면 즉시 적용"
          />
        </label>
        <span className="text-xs text-zinc-500">
          {currentHl ? `적용중: ${currentHl}` : "적용: 없음"}
        </span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* 글머리 기호 */}
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
  );
}
