// src/features/posts/AddCategoryButton.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/shared/lib/supabase";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tag, X } from "lucide-react";

type Props = {
  className?: string;
  isAdmin?: boolean; // 관리자 모드 여부
  floating?: boolean; // 기본 true (FAB)
  label?: string; // 버튼 라벨
  onAdded?: (name: string) => void; // 추가 성공 시 부모 알림(선택)
};

export default function AddCategoryButton({
  className,
  isAdmin = false,
  floating = true,
  label = "카테고리 추가",
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving]);

  // 열릴 때 입력에 포커스
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const onOpen = () => {
    if (!isAdmin) {
      alert("관리자 모드가 아닙니다.");
      return;
    }
    setOpen(true);
  };

  const onConfirm = async () => {
    const n = name.trim();
    if (n.length === 0) {
      alert("카테고리 이름을 입력하세요.");
      return;
    }
    if (n.length > 10) {
      alert("카테고리 이름이 너무 깁니다(최대 60자).");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("categories").insert({ name: n });
      if (error) throw error;
      alert("카테고리가 추가되었습니다.");
      onAdded?.(n);
      setName("");
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "추가에 실패했습니다.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={onOpen}
        className={cn(
          floating
            ? "fixed bottom-18 right-6 z-50 h-12 rounded-full px-4 shadow-lg"
            : "",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Tag size={18} />
          <span>{label}</span>
        </div>
      </Button>

      {/* 오버레이 + 커스텀 모달 */}
      {open && (
        <div className="fixed inset-0 z-[70]">
          {/* dim + blur */}
          <div
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-[2px]",
              saving ? "pointer-events-none" : "cursor-pointer"
            )}
            onClick={() => !saving && setOpen(false)}
          />
          {/* center container */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-8">
              {/* close */}
              <button
                type="button"
                aria-label="닫기"
                className="absolute right-3 top-3 rounded p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => !saving && setOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </button>

              {/* title/desc */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold tracking-tight">
                  카테고리 추가
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  추가할 카테고리의 이름을 입력하세요.
                </p>
              </div>

              {/* form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!saving) void onConfirm();
                }}
                className="grid gap-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="category-name" className="text-sm">
                    이름
                  </Label>
                  <Input
                    id="category-name"
                    ref={inputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예) React, Typescript"
                    disabled={saving}
                    className="h-11 text-base"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={saving}
                    className="h-10 px-4"
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={saving} className="h-10 px-5">
                    {saving ? "추가 중..." : "추가"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
