// src/features/posts/editor/EditorToolbar.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

type Props = { editor: Editor | null; onPickImage?: () => void };

export default function EditorToolbar({ editor, onPickImage }: Props) {
  const [textColor, setTextColor] = useState("#111827");
  const [hlColor, setHlColor] = useState("#fff3a3");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState(
    `"Gowun Dodum", Pretendard, Inter, system-ui, -apple-system, sans-serif`
  );

  const cmd = (fn: () => void) => () => editor?.chain().focus() && fn();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().toggleBold().run())}
      >
        B
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().toggleItalic().run())}
      >
        I
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().toggleUnderline().run())}
      >
        U
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().toggleBulletList().run())}
      >
        • 목록
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().toggleOrderedList().run())}
      >
        1. 목록
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() =>
          editor!.chain().focus().toggleHeading({ level: 2 }).run()
        )}
      >
        H2
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() =>
          editor!.chain().focus().toggleHeading({ level: 3 }).run()
        )}
      >
        H3
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 폰트 크기/패밀리 */}
      <select
        className="h-9 rounded-md border bg-transparent px-2"
        value={fontSize}
        onChange={(e) => setFontSize(e.target.value)}
      >
        {["14px", "16px", "18px", "20px", "24px"].map((sz) => (
          <option key={sz} value={sz}>
            {sz}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() =>
          editor!.chain().focus().setMark("textStyle", { fontSize }).run()
        )}
      >
        글자 크기 적용
      </Button>

      <select
        className="h-9 rounded-md border bg-transparent px-2"
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
      >
        <option
          value={`"Gowun Dodum", Pretendard, Inter, system-ui, -apple-system, sans-serif`}
        >
          Gowun Dodum
        </option>
        <option
          value={`Pretendard, Inter, system-ui, -apple-system, sans-serif`}
        >
          Pretendard
        </option>
        <option value={`Inter, system-ui, -apple-system, sans-serif`}>
          Inter
        </option>
        <option
          value={`"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`}
        >
          JetBrains Mono
        </option>
      </select>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() =>
          editor!.chain().focus().setMark("textStyle", { fontFamily }).run()
        )}
      >
        글꼴 적용
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      {/* 색상/하이라이트 */}
      <label className="flex items-center gap-2 text-sm">
        색상{" "}
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
        />
      </label>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() => editor!.chain().focus().setColor(textColor).run())}
      >
        적용
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={cmd(() => editor!.chain().focus().unsetColor().run())}
      >
        해제
      </Button>

      <label className="ml-2 flex items-center gap-2 text-sm">
        하이라이트{" "}
        <input
          type="color"
          value={hlColor}
          onChange={(e) => setHlColor(e.target.value)}
        />
      </label>
      <Button
        size="sm"
        variant="secondary"
        onClick={cmd(() =>
          editor!.chain().focus().setHighlight({ color: hlColor }).run()
        )}
      >
        적용
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={cmd(() => editor!.chain().focus().unsetHighlight().run())}
      >
        해제
      </Button>

      {/* ⛔ 이미지 버튼은 onPickImage가 있을 때만 노출 */}
      {onPickImage && (
        <>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button size="sm" onClick={onPickImage}>
            이미지 업로드
          </Button>
        </>
      )}
    </div>
  );
}
