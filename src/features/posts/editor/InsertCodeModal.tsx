"use client";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { Editor } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/ui/dialog";

const normalizeLang = (lang?: string) => {
  const l = (lang || "").toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    typescript: "typescript",
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    sh: "bash",
    shell: "bash",
    bash: "bash",
  };
  return map[l] || l || "plaintext";
};

export default function InsertCodeModal({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("plaintext");
  const [filename, setFilename] = useState("");
  const [code, setCode] = useState("");

  const insert = () => {
    if (!editor || !code.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "codeBlock",
        attrs: { language: normalizeLang(language), filename },
        content: [{ type: "text", text: code }],
      })
      .run();
    setOpen(false);
    setCode("");
    setFilename("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="hover:cursor-pointer hover:bg-neutral-200"
        >{`</> 코드 삽입`}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>코드 블록 삽입</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="제목"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <select
              className="border rounded px-2"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="plaintext">plain</option>
              <option value="ts">ts</option>
              <option value="tsx">tsx</option>
              <option value="js">js</option>
              <option value="bash">bash</option>
            </select>
          </div>
          {/* 필요하면 텍스트 영역도 살짝만 키우되, 넘치면 모달이 스크롤됨 */}
          <Textarea
            placeholder="여기에 코드를 붙여넣으세요"
            rows={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button className="hover:cursor-pointer" onClick={insert}>
            삽입
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
