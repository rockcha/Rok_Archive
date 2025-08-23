// src/features/todos/TodoForm.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/shared/ui/sheet";

type Props = {
  onAdd: (content: string, isDaily: boolean) => Promise<void>;
  className?: string;
};

export default function TodoForm({ onAdd, className }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isDaily, setIsDaily] = useState(true);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 열리면 인풋 포커스
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = content.trim();
    if (!text) {
      toast("할 일을 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      await onAdd(text, isDaily);
      toast.success("할 일이 추가되었습니다.");
      setContent("");
      setIsDaily(true);
      setOpen(false);
    } catch (e) {
      toast.error("추가에 실패했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Sheet open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        {/* 트리거: 추가 버튼만 노출 */}
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="할 일 추가"
            title="할 일 추가"
            className="
              cursor-pointer
              px-3 py-2 rounded-xl
              inline-flex items-center gap-2
              transition-colors
            "
          >
            할 일 추가하기
          </Button>
        </SheetTrigger>

        {/* 시트 내용 */}
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>새로운 할 일</SheetTitle>
            <SheetDescription>내용과 옵션을 입력하세요.</SheetDescription>
          </SheetHeader>

          <form className="grid gap-4 p-4 pt-0" onSubmit={handleAdd}>
            <div className="grid gap-4">
              <label htmlFor="todo-content" className="text-sm font-medium">
                내용
              </label>
              <Input
                id="todo-content"
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="예) 운동 30분"
                disabled={loading}
                className="h-11 text-base"
              />
            </div>

            <label
              htmlFor="todo-daily"
              className="flex items-center gap-2 text-sm text-neutral-700 select-none"
            >
              <Checkbox
                id="todo-daily"
                checked={isDaily}
                onCheckedChange={(v) => setIsDaily(Boolean(v))}
                disabled={loading}
                className="hover:cursor-pointer"
              />
              매일 할 일(daily)
            </label>

            <SheetFooter className="pt-10">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="hover:cursor-pointer"
                >
                  닫기
                </Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={loading}
                className="hover:cursor-pointer"
              >
                {loading ? "저장 중..." : "저장"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
