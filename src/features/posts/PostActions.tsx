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

  // ✏️ 수정 버튼 클릭 시 이동
  const onEdit = () => {
    navigate(`/posts/edit/${postId}`);
  };

  // 🗑️ 삭제 버튼 클릭 시 실행
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
      {/* ✅ 화면 우측 하단 고정된 액션 버튼 영역 */}
      <div className="fixed bottom-6 right-6 z-50 flex jutify-center gap-2">
        {/* ✏️ 수정 버튼 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label="수정"
              onClick={onEdit}
              className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 hover:cursor-pointer"
            >
              <Pencil className="h-6 w-6" />
              <span className="sr-only">수정</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>수정</TooltipContent>
        </Tooltip>

        {/* 🗑️ 삭제 버튼 (다이얼로그 포함) */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="삭제"
                  className="w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-105 hover:cursor-pointer"
                >
                  <Trash2 className="h-6 w-6" />
                  <span className="sr-only">삭제</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>삭제</TooltipContent>
          </Tooltip>

          {/* 🗨️ 삭제 확인 다이얼로그 */}
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
                className="hover:cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
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
