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

import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  // 🗑️ 삭제 버튼 클릭 시 실행 (toast 사용)
  const onDelete = async () => {
    try {
      setDeleting(true);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      setOpen(false);
      toast.success("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      toast.error("삭제 중 오류가 발생했습니다.", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-center ">
      {/* ✏️ 수정 */}
      <Button
        type="button"
        variant="ghost"
        aria-label="수정"
        onClick={onEdit}
        className="
         cursor-pointer
          px-2 py-2
           [&>svg]:!h-6 [&>svg]:!w-6
        "
      >
        <Pencil className="!h-6 !w-6 text-neutral-600" />
      </Button>

      {/* 🗑️ 삭제 + 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="삭제"
            className="
          
            ursor-pointer
              px-2 py-2
             
               [&>svg]:!h-6 [&>svg]:!w-6
            "
          >
            <Trash2 className="!h-6 !w-6 text-rose-600" />
          </Button>
        </DialogTrigger>

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
  );
}
