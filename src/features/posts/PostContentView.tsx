// src/features/posts/components/PostContentView.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { createExtensions } from "./editor/tiptapExtension";

type Props = {
  contentJson?: JSONContent | string | null;
  contentMarkdown?: string | null;
};

/* ───────── helpers: type guards ───────── */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

type DocLike = { type: "doc"; content?: JSONContent[] };

function isDocLike(v: unknown): v is DocLike {
  return (
    isRecord(v) &&
    v["type"] === "doc" &&
    Array.isArray((v as { content?: unknown }).content)
  );
}

/* ───────── 1) 문자열/배열/단일 노드 → 항상 doc 루트 ───────── */

function coerceToDoc(raw: unknown): JSONContent | null {
  if (raw == null) return null;

  let v: unknown = raw;

  // string → parse
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }

  // { content_json: {...} } 래핑 제거
  if (isRecord(v) && "content_json" in v) {
    v = (v as Record<string, unknown>).content_json;
  }

  // 이미 doc
  if (isDocLike(v)) return v as JSONContent;

  // content만 있는 객체라면 감싸기
  if (
    isRecord(v) &&
    Array.isArray((v as { content?: unknown }).content) &&
    !("type" in v)
  ) {
    const content = (v as { content: unknown[] }).content as JSONContent[];
    return { type: "doc", content };
  }

  // 배열(노드 리스트)
  if (Array.isArray(v)) {
    return { type: "doc", content: v as JSONContent[] };
  }

  // 단일 노드
  if (isRecord(v) && "type" in v) {
    return { type: "doc", content: [v as JSONContent] };
  }

  return null;
}

/* ───────── 2) 빈 text/빈 paragraph·heading 제거 ───────── */

function sanitizeNode(n: JSONContent | null | undefined): JSONContent | null {
  if (!n) return null;

  // text: 빈 문자열 금지
  if (n.type === "text") {
    if (typeof n.text !== "string" || n.text.length === 0) return null;
    return n;
  }

  // 자식 정리
  if (Array.isArray(n.content)) {
    const cleaned = n.content
      .map(sanitizeNode)
      .filter((x): x is JSONContent => Boolean(x));

    const withCleaned: JSONContent = { ...n, content: cleaned };

    // 내용이 없어진 paragraph/heading은 제거
    if (
      (withCleaned.type === "paragraph" || withCleaned.type === "heading") &&
      (!withCleaned.content || withCleaned.content.length === 0)
    ) {
      return null;
    }
    return withCleaned;
  }

  return n;
}

function sanitizeDoc(doc: JSONContent): JSONContent {
  const content = Array.isArray(doc.content) ? doc.content : [];
  const cleaned = content
    .map(sanitizeNode)
    .filter((x): x is JSONContent => Boolean(x));
  return { ...doc, content: cleaned };
}

export default function PostContentView({
  contentJson,
  contentMarkdown,
}: Props) {
  const doc = useMemo(() => coerceToDoc(contentJson), [contentJson]);
  const safeDoc = useMemo(() => (doc ? sanitizeDoc(doc) : null), [doc]);

  const editor = useEditor({
    extensions: createExtensions(),
    content: safeDoc ?? "",
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc dark:prose-invert max-w-none min-h-[70vh] bg-white/90 dark:bg-zinc-900 border rounded-xl p-6",
        spellcheck: "false",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (safeDoc) editor.commands.setContent(safeDoc, { emitUpdate: false });
    else editor.commands.clearContent(true);
  }, [editor, safeDoc]);

  // JSON이 없고 Markdown만 있을 때 폴백
  if (!safeDoc && contentMarkdown) {
    return (
      <pre className="whitespace-pre-wrap rounded-xl border bg-white dark:bg-zinc-900 p-4 text-sm min-h-[60vh] md:min-h-[80vh]">
        {contentMarkdown}
      </pre>
    );
  }

  return <EditorContent editor={editor} />;
}
