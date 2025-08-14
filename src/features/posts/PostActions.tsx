// src/features/posts/components/PostActions.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../Auth/useAdmin"; // ✅
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";

type Props = {
  postId: string;
  slug?: string | null;
};

export default function PostActions({ postId, slug }: Props) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAdmin) return null;

  const onEdit = () => {
    // TODO: 수정 페이지 연결
    // 예: navigate(`/posts/${slug ?? `id/${postId}`}/edit`);
    console.log("TODO → edit post:", slug ?? postId);
  };

  const onDelete = async () => {
    try {
      setDeleting(true);
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      // post_assets가 FK CASCADE면 함께 삭제됨
      setOpen(false);
      navigate("/"); // 삭제 후 목록/홈으로 이동
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onEdit}>
        수정
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive">
            삭제
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
