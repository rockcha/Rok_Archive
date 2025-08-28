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

  // ✏️ 수정
  const onEdit = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 수정할 수 있습니다." });
      return;
    }
    navigate(`/posts/edit/${postId}`);
  };

  // 🗑️ 삭제 다이얼로그 열기
  const onRequestDelete = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 삭제할 수 있습니다." });
      return;
    }
    setOpen(true);
  };

  // 🗑️ 삭제 실행
  const onDelete = async () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 삭제할 수 있습니다." });
      return;
    }
    try {
      setDeleting(true);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      setOpen(false);
      toast.success("게시글이 삭제되었습니다.");
      navigate("/main");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      toast.error("삭제 중 오류가 발생했습니다.", { description: msg });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-center gap-1">
      {/* ✏️ 수정 */}
      <Button
        type="button"
        variant="outline"
        aria-label="수정"
        onClick={onEdit}
        className="
          cursor-pointer
          px-2 py-2
          [&>svg]:!h-4 [&>svg]:!w-4
        "
      >
        <Pencil className="!h-6 !w-6 text-neutral-600" />
      </Button>

      {/* 🗑️ 삭제 + 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label="삭제"
            onClick={onRequestDelete}
            className="
              cursor-pointer
              px-2 py-2
              [&>svg]:!h-4 [&>svg]:!w-4
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
