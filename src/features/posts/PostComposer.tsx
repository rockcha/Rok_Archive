// src/features/posts/PostComposer.tsx
"use client";

import {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import type { Content, JSONContent } from "@tiptap/core";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";

import { Label } from "@radix-ui/react-label";
import { Input } from "@/shared/ui/input";
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

type Category = { id: string | number; name: string };
type ComposerMode = "create" | "edit";

type InitialData = {
  id?: string;
  title?: string;
  categoryId?: string | number | null;
  tags?: string[];
  content?: JSONContent | string | null;
};

export type PostComposerHandle = {
  /** 외부에서 호출: 저장 가능 여부 확인 + 저장 시도 */
  requestSave: () => void;
};

type Props = {
  mode?: ComposerMode;
  initial?: InitialData;
  onSaved?: (postId: string) => void;
  /** 상위로 dirty 상태 알림 */
  onDirtyChange?: (dirty: boolean) => void;
};

const PostComposer = forwardRef<PostComposerHandle, Props>(
  function PostComposer(
    { mode = "create", initial, onSaved, onDirtyChange },
    ref
  ) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
      initial?.categoryId != null ? String(initial.categoryId) : ""
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [tagsRaw, setTagsRaw] = useState(
      Array.isArray(initial?.tags) ? initial!.tags!.join(", ") : ""
    );
    const [, setSaving] = useState(false);

    const navigate = useNavigate();
    const editor = useRichEditor();

    // ---- 유틸: dirty 계산 공통함수
    const computeDirty = useCallback(() => {
      const t = title.trim();
      const g = tagsRaw.trim();
      const c = selectedCategoryId;
      const eText = editor?.getText().trim() ?? "";
      return Boolean(t || g || c || eText);
    }, [title, tagsRaw, selectedCategoryId, editor]);

    const notifyDirty = useCallback(() => {
      onDirtyChange?.(computeDirty());
    }, [computeDirty, onDirtyChange]);

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
          toast.error("카테고리를 불러오지 못했습니다.");
        } else {
          setCategories((data ?? []) as Category[]);
        }
        setLoadingCats(false);
      })();
      return () => {
        mounted = false;
      };
    }, []);

    // 에디터 초기 내용
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
      // 초기 내용 반영 후 dirty 알려주기
      notifyDirty();
    }, [editor, initial?.content, notifyDirty]);

    // ✅ 입력값 변경 시 dirty 갱신
    useEffect(() => {
      notifyDirty();
    }, [title, tagsRaw, selectedCategoryId, notifyDirty]);

    // ✅ tiptap 에디터 타이핑/변경 시 dirty 갱신 (핵심 수정 포인트)
    useEffect(() => {
      if (!editor) return;

      const handler = () => notifyDirty();
      editor.on("update", handler);
      editor.on("selectionUpdate", handler); // 붙여도 무방(선택 변경 시 등)

      return () => {
        editor.off("update", handler);
        editor.off("selectionUpdate", handler);
      };
    }, [editor, notifyDirty]);

    // 제출 가능 여부
    const isReadyToSubmit = useMemo(() => {
      const tags = parseTags(tagsRaw);
      return title.trim().length > 0 && !!selectedCategoryId && tags.length > 0;
    }, [title, selectedCategoryId, tagsRaw]);

    // 실제 저장 로직
    const doSave = useCallback(async () => {
      if (!editor) return;
      if (!isReadyToSubmit) {
        toast.info("제목·카테고리·태그는 필수입니다.");
        return;
      }
      setSaving(true);
      try {
        const json = editor.getJSON();
        const tags = parseTags(tagsRaw);
        const category_id: string | number = /^\d+$/.test(selectedCategoryId)
          ? Number(selectedCategoryId)
          : selectedCategoryId;

        if (mode === "edit" && initial?.id) {
          const { error } = await supabase
            .from("posts")
            .update({ title, category_id, tags, content_json: json })
            .eq("id", initial.id);
          if (error) throw error;

          toast.success("수정 완료");
          onSaved?.(initial.id);
          onDirtyChange?.(false);
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
              published_at: new Date().toISOString(),
            })
            .select("id")
            .single();
          if (error) throw error;

          toast.success("작성 완료", { description: "홈으로 이동합니다." });
          onSaved?.(data!.id);

          // reset (→ dirty 해제)
          setTitle("");
          setSelectedCategoryId("");
          setTagsRaw("");
          editor.commands.clearContent(true);
          onDirtyChange?.(false);

          navigate("/main");
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "저장 실패";
        toast.error("처리 중 오류가 발생했습니다.", { description: msg });
      } finally {
        setSaving(false);
      }
    }, [
      editor,
      isReadyToSubmit,
      title,
      tagsRaw,
      selectedCategoryId,
      mode,
      initial?.id,
      onSaved,
      navigate,
      onDirtyChange,
    ]);

    // 부모에 공개할 메서드
    useImperativeHandle(ref, () => ({ requestSave: doSave }), [doSave]);

    return (
      <div className="space-y-4">
        {/* 상단 입력 바 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1">
            {/* 카테고리 */}
            <div className="flex items-center gap-2 md:min-w-[220px]">
              <Label className="text-xs text-zinc-500">카테고리 *</Label>
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

        {/* 툴바 & 에디터 */}
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} className="tiptap " />

        <Separator className="opacity-0" />
      </div>
    );
  }
);

export default PostComposer;
