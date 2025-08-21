// src/features/todos/TodoItem.tsx
"use client";

import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import type { TodoRow } from "./types";
import { toast } from "sonner"; // ✅ sonner
import { Pencil, Trash2, Check, X } from "lucide-react";

type Props = {
  item: TodoRow;
  onUpdate: (
    id: string,
    patch: Partial<Pick<TodoRow, "content" | "isDaily">>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TodoItem({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const [isDaily, setIsDaily] = useState(item.isDaily);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    try {
      setBusy(true);
      await onUpdate(item.id, { content: content.trim(), isDaily });
      setEditing(false);
      toast.success("수정되었습니다.");
    } catch (e) {
      toast.error("수정에 실패했습니다.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  // ✅ 기본 alert/confirm 대신 sonner 토스트로 '삭제 확인'
  const handleDeleteConfirm = async () => {
    try {
      setBusy(true);
      await onDelete(item.id);
      toast.success("삭제되었습니다.");
    } catch (e) {
      toast.error("삭제에 실패했습니다.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRequest = () => {
    console.log("handledeleterequest");
    toast("정말 삭제할까요?", {
      description: item.content,
      action: {
        label: "삭제",
        onClick: handleDeleteConfirm,
      },
    });
  };

  return (
    <div className="flex items-stretch gap-2 rounded-md border border-neutral-200 p-3">
      {editing ? (
        <div className="flex-1 flex flex-col gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-neutral-300"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600 select-none cursor-pointer">
            <Checkbox
              checked={isDaily}
              onCheckedChange={(v) => setIsDaily(Boolean(v))}
              className="cursor-pointer" // ✅ 체크박스도 pointer
            />
            daily
          </label>
        </div>
      ) : (
        <div className="flex-1">
          <p className="text-sm text-neutral-800">{item.content}</p>
        </div>
      )}

      {/* ✅ 아이콘 버튼 묶음을 세로 중앙에 고정 */}
      <div className="flex gap-1 my-auto">
        {editing ? (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={busy}
              className="hover:cursor-pointer"
              aria-label="저장"
              title="저장"
            >
              <Check className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(false)}
              className="hover:cursor-pointer"
              aria-label="취소"
              title="취소"
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="hover:cursor-pointer"
              aria-label="수정"
              title="수정"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDeleteRequest}
              disabled={busy}
              // ✅ ghost 기본 효과를 rose로 덮어쓰기
              className="hover:cursor-pointer hover:bg-rose-50 hover:text-rose-500 text-rose-500"
              aria-label="삭제"
              title="삭제"
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
