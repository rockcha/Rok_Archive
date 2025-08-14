// src/features/posts/PostComposer.tsx
"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@/shared/ui/separator";
import { EditorContent } from "@tiptap/react";

import { useRichEditor } from "@/features/posts/editor/useRichEditor";
import EditorToolbar from "@/features/posts/editor/EditorToolbar";
import { slugify } from "@/shared/utils/slugify";
import { parseTags } from "@/shared/utils/parseTags";
import { CATEGORIES } from "@/features/posts/categories";

export default function PostComposer() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [tagsRaw, setTagsRaw] = useState("");

  const editor = useRichEditor();

  const isReadyToSubmit = useMemo(() => {
    const tags = parseTags(tagsRaw);
    return title.trim().length > 0 && category && tags.length > 0;
  }, [title, category, tagsRaw]);

  const [saving, setSaving] = useState(false);
  const onSave = async () => {
    if (!editor) return;
    if (!isReadyToSubmit) {
      alert("제목·카테고리·태그는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      const json = editor.getJSON();
      const summary = editor.getText().trim().slice(0, 200);
      const tags = parseTags(tagsRaw);
      const slug = slugify(title);

      const { error } = await supabase.from("posts").insert({
        slug,
        title,
        category_type: category,
        tags,
        content_json: json,
        summary,
        published_at: new Date().toISOString(),
      });
      if (error) throw error;

      alert("작성 완료!");
      setTitle("");
      setCategory("");
      setTagsRaw("");
      editor.commands.clearContent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 메타 폼 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            placeholder="예) React 훅 가이드"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">카테고리 *</Label>
          <select
            id="category"
            className="h-9 rounded-md border bg-transparent px-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">선택하세요</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 grid gap-2">
          <Label htmlFor="tags">태그 * (쉼표로 구분)</Label>
          <Input
            id="tags"
            placeholder="react, hooks, router"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
          <p className="text-xs text-zinc-500">
            예: <code>react, typescript, supabase</code>
          </p>
        </div>
      </div>

      <Separator className="bg-zinc-200 dark:bg-zinc-800" />

      {/* 툴바 + 에디터 (이미지 버튼 없음) */}
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />

      {/* 제출 */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={!isReadyToSubmit || saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? "저장 중..." : "작성 완료"}
        </Button>
      </div>
    </div>
  );
}
