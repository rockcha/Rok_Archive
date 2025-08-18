// src/features/posts/PostComposer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";

import { Label } from "@radix-ui/react-label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";

import { EditorContent } from "@tiptap/react";
import { useRichEditor } from "@/features/posts/editor/useRichEditor";
import EditorToolbar from "@/features/posts/editor/EditorToolbar";
import { slugify } from "@/shared/utils/slugify";
import { parseTags } from "@/shared/utils/parseTags";
import type { JSONContent } from "@tiptap/core";
import { ChevronDown, ChevronRight } from "lucide-react";

type Category = { id: string | number; name: string };

type ComposerMode = "create" | "edit";

type InitialData = {
  id?: string; // edit 시 필수
  title?: string;
  categoryId?: string | number | null;
  tags?: string[];
  content?: JSONContent | string | null;
};

export default function PostComposer({
  mode = "create",
  initial,
  onSaved,
}: {
  mode?: ComposerMode;
  initial?: InitialData;
  onSaved?: (postId: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initial?.categoryId != null ? String(initial.categoryId) : ""
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [tagsRaw, setTagsRaw] = useState(
    Array.isArray(initial?.tags) ? initial!.tags!.join(", ") : ""
  );
  const [saving, setSaving] = useState(false);

  // ✅ 접기/펼치기 상태 (메타 카드)
  const [metaOpen, setMetaOpen] = useState(true);

  const editor = useRichEditor();

  // 카테고리 로드
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

  // 초기 콘텐츠 주입 (edit 모드)
  useEffect(() => {
    if (!editor) return;
    if (initial?.content != null) {
      editor.commands.setContent(initial.content as any, false); // JSON/HTML 모두 허용
    } else {
      editor.commands.clearContent(true);
    }
  }, [editor, initial?.content]);

  const isReadyToSubmit = useMemo(() => {
    const tags = parseTags(tagsRaw);
    return title.trim().length > 0 && !!selectedCategoryId && tags.length > 0;
  }, [title, selectedCategoryId, tagsRaw]);

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

      const category_id: string | number = /^\d+$/.test(selectedCategoryId)
        ? Number(selectedCategoryId)
        : selectedCategoryId;

      if (mode === "edit" && initial?.id) {
        const { error } = await supabase
          .from("posts")
          .update({
            title,
            category_id,
            tags,
            content_json: json,
            summary,
          })
          .eq("id", initial.id);
        if (error) throw error;

        alert("수정 완료!");
        onSaved?.(initial.id);
      } else {
        const slug = slugify(title);
        const { data, error } = await supabase
          .from("posts")
          .insert({
            slug,
            title,
            category_id,
            tags,
            content_json: json,
            summary,
            published_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error) throw error;

        alert("작성 완료!");
        onSaved?.(data!.id);
        setTitle("");
        setSelectedCategoryId("");
        setTagsRaw("");
        editor.commands.clearContent(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // 나가기 경고(작성/수정 중)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saving) return;
      const dirty =
        title.trim() ||
        tagsRaw.trim() ||
        selectedCategoryId ||
        (editor?.getText().trim() ?? "");
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saving, title, tagsRaw, selectedCategoryId, editor]);

  return (
    <div className="space-y-6">
      {/* ─────────────────────
          메타 카드 (접기/펼치기)
         ───────────────────── */}
      <Card className="w-full md:w-1/2 border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {metaOpen ? (
              <ChevronDown className="h-4 w-4 opacity-70" />
            ) : (
              <ChevronRight className="h-4 w-4 opacity-70" />
            )}
            <h3 className="text-sm font-semibold">카테고리 · 제목 · 태그</h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMetaOpen((v) => !v)}
            aria-expanded={metaOpen}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {metaOpen ? "접기" : "펼치기"}
          </Button>
        </div>

        {metaOpen && (
          <CardContent className="space-y-4 px-4 pb-4">
            {/* 카테고리 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">카테고리 *</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={loadingCats}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingCats ? "불러오는 중…" : "카테고리를 선택하세요"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 제목 */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                제목 *
              </Label>
              <Input
                id="title"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 text-base"
              />
            </div>

            {/* 태그 */}
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-sm font-semibold">
                태그 *{" "}
                <span className="text-xs text-zinc-500">(쉼표로 구분)</span>
              </Label>
              <Input
                id="tags"
                placeholder="react, ts, ui"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                className="h-10 text-base"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* ─────────────────────
          에디터 툴바 (상단 고정)
         ───────────────────── */}
      <div
        className="
          sticky top-[100px] z-40
          border rounded-md rounded-b-none
          bg-white/90
          p-2
        "
      >
        <EditorToolbar editor={editor} />
      </div>

      {/* 에디터 */}
      <div className="rounded-b-md rounded-t-none border bg-background">
        <EditorContent
          editor={editor}
          className="tiptap min-h-[60vh] rounded-b-md p-4"
        />
      </div>

      {/* 제출 */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={!isReadyToSubmit || saving}
          className="bg-emerald-600 hover:bg-emerald-700 hover:cursor-pointer"
        >
          {saving
            ? mode === "edit"
              ? "수정 중..."
              : "저장 중..."
            : mode === "edit"
            ? "수정 완료"
            : "작성 완료"}
        </Button>
      </div>

      <Separator className="opacity-0" />
    </div>
  );
}
