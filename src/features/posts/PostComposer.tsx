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
import { Save } from "lucide-react";

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

  const navigate = useNavigate();
  const editor = useRichEditor();

  // 디버깅 (원하면 주석 처리)
  useEffect(() => {
    if (!editor) return;
    // console.log(
    //   "[extensions]",
    //   editor.extensionManager.extensions.map((e) => e.name)
    // );
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

  // ── UI ──
  return (
    <div className="space-y-4">
      {/* 상단 안내/입력 바: 한 줄로 배치 (작은 화면에서는 세로로 스택) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* 안내 문구 */}

        {/* 입력 영역 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1">
          {/* 카테고리 */}
          <div className="flex items-center gap-2 md:min-w-[220px] ">
            <Label className="text-xs text-zinc-500 ">카테고리 *</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={loadingCats}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-background hover:cursor-pointer">
                <SelectValue
                  placeholder={loadingCats ? "불러오는 중…" : "카테고리 선택"}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem
                    key={String(c.id)}
                    value={String(c.id)}
                    className="hover:cursor-pointer"
                  >
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Label htmlFor="title" className="text-xs text-zinc-500">
              제목 *
            </Label>
            <Input
              id="title"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background h-10 text-base"
            />
          </div>

          {/* 태그 */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Label htmlFor="tags" className="text-xs text-zinc-500">
              태그 *
            </Label>
            <Input
              id="tags"
              placeholder="react, ts, ui"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              className="h-10 text-base bg-background"
            />
          </div>
        </div>
      </div>

      {/* 툴바 */}
      <EditorToolbar editor={editor} />

      {/* 본문 에디터 */}
      <EditorContent editor={editor} className="tiptap min-h-[60vh]" />

      {/* 구분선 (투명) */}
      <Separator className="opacity-0" />

      {/* 고정 동그라미 등록 버튼 (오른쪽 하단) */}
      <Button
        type="button"
        onClick={onSave}
        disabled={!isReadyToSubmit || saving}
        aria-label={mode === "edit" ? "수정 완료" : "작성 완료"}
        className={cnFloatingBtn(!isReadyToSubmit || saving)}
      >
        <Save className="h-5 w-5" />
      </Button>
    </div>
  );
}

/** 동그라미 FAB 클래스 헬퍼 */
function cnFloatingBtn(disabled: boolean) {
  const base =
    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center";
  const enabled =
    "bg-emerald-600 hover:bg-emerald-700 text-white hover:cursor-pointer";
  const disabledCls = "bg-emerald-300 text-white opacity-70 cursor-not-allowed";
  return `${base} ${disabled ? disabledCls : enabled}`;
}
