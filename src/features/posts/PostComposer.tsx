// src/features/posts/PostComposer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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

type Category = {
  id: string | number; // DB 타입에 맞게 uuid | bigint 등
  name: string;
};

export default function PostComposer() {
  const [title, setTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); // select value는 string으로 관리
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [tagsRaw, setTagsRaw] = useState("");

  const editor = useRichEditor();

  // 카테고리 목록 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCats(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error("카테고리 로드 실패:", error.message);
        setCategories([]);
      } else {
        setCategories((data ?? []) as Category[]);
      }
      setLoadingCats(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isReadyToSubmit = useMemo(() => {
    const tags = parseTags(tagsRaw);
    return title.trim().length > 0 && !!selectedCategoryId && tags.length > 0;
  }, [title, selectedCategoryId, tagsRaw]);

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

      // select는 string이니 DB 타입에 맞추어 변환
      // (uuid면 그대로 string, bigint면 Number 변환 등)
      const category_id: string | number = /^\d+$/.test(selectedCategoryId)
        ? Number(selectedCategoryId)
        : selectedCategoryId;

      const { error } = await supabase.from("posts").insert({
        slug,
        title,
        category_id, // ✅ id로 저장
        tags,
        content_json: json,
        summary,
        published_at: new Date().toISOString(),
      });
      if (error) throw error;

      alert("작성 완료!");
      setTitle("");
      setSelectedCategoryId("");
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
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={loadingCats}
          >
            <option value="">
              {loadingCats ? "불러오는 중…" : "선택하세요"}
            </option>
            {categories.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {c.name}
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
