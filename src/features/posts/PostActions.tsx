// src/features/posts/components/PostActions.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../Auth/useAdmin";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  postId: string;
  slug?: string | null;
};

export default function PostActions({ postId }: Props) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const onEdit = () => {
    navigate(`/posts/edit/${postId}`);
  };

  const onDelete = async () => {
    try {
      setDeleting(true);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      setOpen(false);
      navigate("/");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-2">
        {/* 수정 (아이콘 버튼) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="수정"
              onClick={onEdit}
              className="
                size-9 rounded-full hover:cursor-pointer
                transition-transform duration-150 hover:scale-110 active:scale-95
                hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                hover:text-emerald-700 dark:hover:text-emerald-300
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                hover:shadow-md
              "
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">수정</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>수정</TooltipContent>
        </Tooltip>

        {/* 삭제 (아이콘 버튼 + 다이얼로그 트리거) */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="삭제"
                  className="
                    size-9 rounded-full hover:cursor-pointer
                    transition-transform duration-150 hover:scale-110 active:scale-95
                    hover:bg-rose-50 dark:hover:bg-rose-900/30
                    hover:text-rose-700 dark:hover:text-rose-300
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400
                    hover:shadow-md
                  "
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">삭제</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>삭제</TooltipContent>
          </Tooltip>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              이 작업은 되돌릴 수 없습니다.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="hover:cursor-pointer"
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={deleting}
                className="
                  hover:cursor-pointer
                  transition-transform duration-150 hover:scale-[1.02] active:scale-95
                  hover:shadow-md
                "
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
