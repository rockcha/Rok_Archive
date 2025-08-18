// src/features/posts/editor/EditorToolbar.tsx
"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
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

// 고정 하이라이트 즐겨찾기(추가/삭제 없음)
const FAVORITE_HL_COLORS = [
  "#fff3a3",
  "#ffe8a3",
  "#ffd6e7",
  "#c6f7d0",
  "#d0ebff",
];

/** 노드 선택이면 텍스트 선택으로 바꿔서 마크가 확실히 먹게 하는 헬퍼 */
function applyWithTextSelection(editor: Editor, apply: (chain: any) => any) {
  const sel: any = editor.state.selection; // TextSelection | NodeSelection
  let chain = editor.chain().focus();

  if (!sel.empty) {
    const isNodeSel = !!sel.node; // NodeSelection이면 truthy
    if (isNodeSel) {
      const from = sel.from + 1; // 노드 안쪽으로 들어가서
      const to = sel.to - 1; // 텍스트 전체 선택
      if (to > from) {
        chain = chain.setTextSelection({ from, to });
      }
    }
  }
  apply(chain).run();
}

export default function EditorToolbar({ editor }: Props) {
  const [fontSize, setFontSize] = React.useState(DEFAULT_FONT_SIZE);
  const [fontFamily, setFontFamily] = React.useState(DEFAULT_FONT_FAMILY);
  const [bulletValue, setBulletValue] = React.useState("");

  // 하이라이트 상태 (null = 없음)
  const [hlColor, setHlColor] = React.useState("#fff3a3"); // 피커 현재값
  const [currentHl, setCurrentHl] = React.useState<string | null>(null);

  if (!editor) return null;

  // 처음 로드 시 기본 글꼴/크기 적용
  React.useEffect(() => {
    (editor.chain() as any).focus().setFontFamily?.(fontFamily).run();
    editor.chain().focus().setMark("textStyle", { fontSize }).run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // 선택/트랜잭션 변경 시 현재 하이라이트 반영
  React.useEffect(() => {
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
    const off1 = (editor as any).on?.("selectionUpdate", update);
    const off2 = (editor as any).on?.("transaction", update);
    return () => {
      if (typeof off1 === "function") off1();
      if (typeof off2 === "function") off2();
    };
  }, [editor]);

  // 글자 크기/글꼴
  const applyFontSize = (size: string) => {
    setFontSize(size);
    applyWithTextSelection(editor, (ch) =>
      ch.setMark("textStyle", { fontSize: size })
    );
  };
  const applyFontFamily = (ff: string) => {
    setFontFamily(ff);
    applyWithTextSelection(editor, (ch: any) =>
      ch.setFontFamily ? ch.setFontFamily(ff) : ch
    );
  };

  // 하이라이트 색 지정/해제
  const setHighlightColor = (color: string | null) => {
    if (color == null) {
      editor.chain().focus().unsetHighlight().run();
      return;
    }
    setHlColor(color);
    applyWithTextSelection(editor, (ch: any) =>
      ch.setHighlight ? ch.setHighlight({ color }) : ch
    );
  };

  // 글머리 기호
  const insertBullet = (symbol: string) => {
    editor.chain().focus().insertContent(`${symbol} `).run();
    setBulletValue("");
  };

  // B/I/U: 상호배타(Exclusive) 토글
  type Fmt = "bold" | "italic" | "underline" | null;
  const [activeFmt, setActiveFmt] = React.useState<Fmt>(null);

  const toggleExclusive = (fmt: Exclude<Fmt, null>) => {
    const chain = editor.chain().focus();

    if (activeFmt === fmt) {
      if (fmt === "bold" && editor.isActive("bold")) chain.toggleBold();
      if (fmt === "italic" && editor.isActive("italic")) chain.toggleItalic();
      if (fmt === "underline" && (editor as any).isActive?.("underline"))
        (chain as any).toggleUnderline?.();
      chain.run();
      setActiveFmt(null);
      return;
    }

    if (activeFmt === "bold" && editor.isActive("bold")) chain.toggleBold();
    if (activeFmt === "italic" && editor.isActive("italic"))
      chain.toggleItalic();
    if (activeFmt === "underline" && (editor as any).isActive?.("underline"))
      (chain as any).toggleUnderline?.();

    if (fmt === "bold" && !editor.isActive("bold")) chain.toggleBold();
    if (fmt === "italic" && !editor.isActive("italic")) chain.toggleItalic();
    if (fmt === "underline" && !(editor as any).isActive?.("underline"))
      (chain as any).toggleUnderline?.();

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

      {/* 하이라이트: 없음(왼쪽) + 즐겨찾기(고정 5개) + 피커 + 상태표시 */}
      <div className="flex items-center gap-3">
        {/* 없음(해제) */}
        <button
          onClick={() => setHighlightColor(null)}
          title="하이라이트 없음"
          className={`h-6 w-6 rounded border ${
            currentHl == null ? "ring-2 ring-emerald-200" : ""
          }`}
          style={{ background: "#ffffff" }}
        />

        {/* 고정 즐겨찾기 스와치 */}
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

        {/* 컬러 피커 + 상태 표시 */}
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
