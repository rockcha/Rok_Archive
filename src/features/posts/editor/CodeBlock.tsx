// src/features/posts/editor/extensions/CodeBlock.tsx
"use client";

import { useMemo, useState } from "react";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { mergeAttributes } from "@tiptap/core";
import { Button } from "@/shared/ui/button";
import { Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import * as LowlightNS from "lowlight";

type LowlightRegisterable = {
  registerLanguage?: (name: string, syntax: unknown) => void;
  register?: (name: string, syntax: unknown) => void;
  createLowlight?: () => LowlightRegisterable;
};

const LowlightMaybeFactory = LowlightNS as unknown as LowlightRegisterable;
const lowlightInst: LowlightRegisterable =
  typeof LowlightMaybeFactory.createLowlight === "function"
    ? LowlightMaybeFactory.createLowlight()
    : LowlightMaybeFactory;

// 언어 모듈
import ts from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml"; // JSX 토큰 보강

// v2/v3 모두 대응: 있는 쪽 사용(표준 이름으로 등록)
const registerFn = (lowlightInst.registerLanguage ?? lowlightInst.register) as
  | ((name: string, syntax: unknown) => void)
  | undefined;

if (registerFn) {
  registerFn("typescript", ts);
  registerFn("javascript", javascript);
  registerFn("bash", bash);
  registerFn("xml", xml);
  registerFn("html", xml);
}

// 언어 정규화
const normalizeLang = (lang?: string) => {
  const l = (lang || "").toLowerCase();
  if (l === "ts" || l === "tsx" || l === "typescript") return "typescript";
  if (l === "js" || l === "jsx" || l === "javascript") return "javascript";
  if (l === "sh" || l === "shell" || l === "bash") return "bash";
  return "plaintext";
};

function CodeBlockView(props: NodeViewProps) {
  const { node } = props;
  const { language = "plaintext", filename = "" } = (node.attrs ?? {}) as {
    language?: string;
    filename?: string;
  };

  // tiptap가 런타임에 넘겨주는 deleteNode는 TS 타입이 없어서 안전 캐스팅으로 꺼냄
  const deleteNode = (props as unknown as { deleteNode?: () => boolean })
    .deleteNode;

  // 배지 텍스트: JSX 감지시 TSX/JSX로 표기
  const langBadge = useMemo(() => {
    const norm = normalizeLang(language);
    const text = String(node?.textContent ?? "");
    const looksLikeJSX = /<\s*[A-Za-z][\w:-]*(\s|>|\/>)/.test(text);
    if (norm === "typescript" && looksLikeJSX) return "TSX";
    if (norm === "javascript" && looksLikeJSX) return "JSX";
    if (norm === "typescript") return "TS";
    if (norm === "javascript") return "JS";
    if (norm === "bash") return "Bash";
    return "Plain";
  }, [language, node]);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(node?.textContent ?? ""));
      setCopied(true);
      toast.success("코드를 복사했어요");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("복사 실패");
    }
  };

  const handleDelete = () => {
    if (typeof deleteNode === "function") deleteNode();
    else props.editor?.chain().focus().deleteSelection().run();
  };

  return (
    <NodeViewWrapper className="relative group my-3 rounded-lg border bg-muted/40 overflow-hidden">
      {/* 헤더: 파일명(title) + 언어 배지  */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        contentEditable={false}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
            {filename || "untitled"}
          </span>
          <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-200">
            {langBadge}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0 hover:cursor-pointer hover:bg-muted active:scale-[0.96] transition"
            onClick={handleCopy}
            aria-label="Copy"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0 hover:cursor-pointer hover:bg-muted active:scale-[0.96] transition"
            onClick={handleDelete}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 코드 */}
      <pre className="rounded-md bg-background/70 dark:bg-zinc-900/70 overflow-auto p-3">
        <NodeViewContent className="hljs p-3 rounded-lg" />
      </pre>
    </NodeViewWrapper>
  );
}

export const CodeBlock = CodeBlockLowlight.extend({
  name: "codeBlock",
  addAttributes() {
    return {
      language: { default: "plaintext" },
      filename: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "pre[data-type='codeBlock']" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "pre",
      mergeAttributes(HTMLAttributes as Record<string, unknown>, {
        "data-type": "codeBlock",
      }),
      ["code", { class: "hljs" }, 0],
    ];
  },
})
  .configure({ lowlight: lowlightInst as unknown as never })
  .extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockView);
    },
  });
