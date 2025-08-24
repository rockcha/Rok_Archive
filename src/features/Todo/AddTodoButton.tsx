// src/features/todos/AddTodoButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";

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
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Props = {
  onAdd: (content: string, isDaily: boolean) => Promise<void>;
  className?: string;
};

export default function AddTodoButton({ onAdd, className }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isDaily, setIsDaily] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
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
      console.error(e);
      toast.error("추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !loading && setOpen(v)}>
      {/* 트리거 버튼 (고정 위치) */}
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="할 일 추가"
          title="할 일 추가"
          className={`
           
            inline-flex flex-col items-center justify-center gap-1
            rounded-xl px-3 py-2
            [&>svg]:!h-6 [&>svg]:!w-6
            cursor-pointer
            ${className ?? ""}
          `}
        >
          <Plus className="text-neutral-600" />
          <span className="text-[12px] font-semibold text-neutral-800">
            할 일 추가
          </span>
        </Button>
      </SheetTrigger>

      {/* 시트 (세로 중앙 정렬 + 적절한 폭) */}
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="w-full max-w-md">
            <SheetHeader className="p-0 mb-4 text-center">
              <SheetTitle className="text-xl">새로운 할 일</SheetTitle>
              <SheetDescription>내용과 옵션을 입력하세요.</SheetDescription>
            </SheetHeader>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
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
                  className="h-11 text-base w-full"
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

              <SheetFooter className="mt-0 p-0 pt-6 flex-row justify-center gap-2">
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
