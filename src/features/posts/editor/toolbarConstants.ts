// src/features/posts/editor/toolbar/toolbar.constants.ts
import type { ChainedCommands } from "@tiptap/core";

export type DividerKind = "solid" | "dotted" | "emoji";

/** 텍스트 기반 구분선 - max-w-lg/14px 기준으로 꽉 차게 */
export const LINE_SOLID =
  "──────────────────────────────────────────────────────────";
export const LINE_DOTTED =
  "··································································································································";
export const LINE_EMOJI =
  "✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦――✦";

export const BULLETS = ["•", "▪", "➜", "✅", "☑️", "🔹", "🔸", "🔷", "🔶"];
export const FAVORITE_HL_COLORS = [
  "#fff3a3",
  "#ffe8a3",
  "#ffd6e7",
  "#c6f7d0",
  "#d0ebff",
];
export const DEFAULT_FONT_FAMILY = `"Gowun Dodum", Pretendard, Inter, system-ui, -apple-system, sans-serif`;

export type ChainWithExtras = ChainedCommands & {
  toggleUnderline?: () => ChainedCommands;
  setHighlight?: (opts: { color: string }) => ChainedCommands;
  extendMarkRange?: (type: string) => ChainedCommands;
};
