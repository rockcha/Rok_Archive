// src/features/posts/PostComposer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Content } from "@tiptap/core";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";

// ── UI 컴포넌트 ──
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

// ── 에디터 ──
import { EditorContent } from "@tiptap/react";
import { useRichEditor } from "@/features/posts/editor/useRichEditor";
import EditorToolbar from "@/features/posts/editor/EditorToolbar";

// ── 유틸 ──
import { slugify } from "@/shared/utils/slugify";
import { parseTags } from "@/shared/utils/parseTags";
import type { JSONContent } from "@tiptap/core";
import { ChevronDown, ChevronRight } from "lucide-react";

// ✨ 추가: ShineBorder + 테마
import { ShineBorder } from "@/shared/magicui/shine-border";
import { useTheme } from "next-themes";

// ── 타입 정의 ──
type Category = { id: string | number; name: string };
type ComposerMode = "create" | "edit";

type InitialData = {
  id?: string;
  title?: string;
  categoryId?: string | number | null;
  tags?: string[];
  content?: JSONContent | string | null;
};

/**
 * 📌 PostComposer
 * - 게시물 작성/수정 폼
 * - 제목, 카테고리, 태그 입력 + Tiptap 에디터
 * - 작성 완료/수정 완료 시 DB 반영
 */
export default function PostComposer({
  mode = "create",
  initial,
  onSaved,
}: {
  mode?: ComposerMode;
  initial?: InitialData;
  onSaved?: (postId: string) => void;
}) {
  // ── 상태 관리 ──
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

  // "카테고리·제목·태그" 카드 접힘 여부
  const [metaOpen, setMetaOpen] = useState(false);

  const navigate = useNavigate();
  const editor = useRichEditor();
  const { theme } = useTheme(); // ✨

  //디버깅
  useEffect(() => {
    if (!editor) return;
    console.log(
      "[extensions]",
      editor.extensionManager.extensions.map((e) => e.name)
    );
  }, [editor]);

  // ── 카테고리 목록 로드 ──
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

  // ── 에디터 초기 컨텐츠 설정 (수정 모드일 경우) ──
  useEffect(() => {
    if (!editor) return;
    const content = initial?.content as Content | null | undefined;
    if (content != null) {
      editor.commands.setContent(content, {
        emitUpdate: false,
        errorOnInvalidContent: false,
      });
    } else {
      editor.commands.clearContent(true);
    }
  }, [editor, initial?.content]);

  // ── 저장 가능 여부 판별 ──
  const isReadyToSubmit = useMemo(() => {
    const tags = parseTags(tagsRaw);
    return title.trim().length > 0 && !!selectedCategoryId && tags.length > 0;
  }, [title, selectedCategoryId, tagsRaw]);

  // ── 저장/수정 처리 ──
  const onSave = async () => {
    if (!editor) return;
    if (!isReadyToSubmit) {
      alert("제목·카테고리·태그는 필수입니다.");
      return;
    }
    setSaving(true);

    try {
      // 에디터 본문
      const json = editor.getJSON();
      const summary = editor.getText().trim().slice(0, 200);
      const tags = parseTags(tagsRaw);

      const category_id: string | number = /^\d+$/.test(selectedCategoryId)
        ? Number(selectedCategoryId)
        : selectedCategoryId;

      if (mode === "edit" && initial?.id) {
        // ✏️ 수정 모드
        const { error } = await supabase
          .from("posts")
          .update({ title, category_id, tags, content_json: json, summary })
          .eq("id", initial.id);
        if (error) throw error;

        alert("수정 완료!");
        onSaved?.(initial.id);
      } else {
        // 📝 새 글 작성
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

        // 폼 초기화
        setTitle("");
        setSelectedCategoryId("");
        setTagsRaw("");
        editor.commands.clearContent(true);
        navigate("/");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── 새로고침/탭 닫기 방지 ──
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

  // ✨ 모노톤 컬러(라이트=블랙 계열, 다크=화이트 계열)
  const monoColors =
    theme === "dark"
      ? ["#ffffff", "#d1d5db", "#9ca3af"]
      : ["#000000", "#4b5563", "#9ca3af"];

  // ── UI ──
  return (
    <div className="space-y-6">
      {/* ────────────────
          (1) 메타 카드 (모노톤 ShineBorder 적용)
          ──────────────── */}
      <div className="fixed top-25 sm:right-3  2xl:right-50 z-50 w-[22rem] max-w-none">
        <div className="relative overflow-hidden rounded-2xl">
          <ShineBorder
            className="z-20"
            shineColor={monoColors}
            borderWidth={2}
            duration={14}
          />
          <Card className="relative z-10 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between px-3 py-1">
              <div className="flex items-center gap-2">
                {/* ▶ 접기/펼치기 토글 */}
                <button
                  type="button"
                  onClick={() => setMetaOpen((v) => !v)}
                  aria-expanded={metaOpen}
                  aria-controls="composer-meta"
                  className="p-1 rounded hover:bg-zinc-100 hover:cursor-pointer dark:hover:bg-zinc-800"
                  title={metaOpen ? "접기" : "펼치기"}
                >
                  {metaOpen ? (
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  )}
                </button>

                <h3 className="text-sm font-semibold">
                  카테고리 · 제목 · 태그
                </h3>
              </div>
            </div>

            {metaOpen && (
              <CardContent id="composer-meta" className="space-y-4 px-4 pb-4">
                {/* 카테고리 선택 */}
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

                {/* 제목 입력 */}
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

                {/* 태그 입력 */}
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

                {/* 저장/수정 버튼 */}
                <div className="flex justify-end pt-2">
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
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* ────────────────
          (2) 에디터 툴바
          ──────────────── */}
      <EditorToolbar editor={editor} />

      {/* ────────────────
          (3) 본문 에디터
          ──────────────── */}
      <EditorContent editor={editor} className="tiptap min-h-[60vh]" />

      {/* 구분선 (투명) */}
      <Separator className="opacity-0" />
    </div>
  );
}
