// src/features/todos/TodoForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";

type Props = {
  onAdd: (content: string, isDaily: boolean) => Promise<void>;
  className?: string;
};

export default function TodoForm({ onAdd, className }: Props) {
  const [content, setContent] = useState("");
  const [isDaily, setIsDaily] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!content.trim()) {
      toast("할 일을 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      await onAdd(content.trim(), isDaily);
      setContent("");
      setIsDaily(true);
      toast.success("할 일이 추가되었습니다.");
    } catch (e) {
      toast.error("추가에 실패했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-center ${
        className ?? ""
      }`}
    >
      <div className="flex-1 mb-6">
        <Input
          placeholder="할 일을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-neutral-300"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 select-none">
        <Checkbox
          checked={isDaily}
          onCheckedChange={(v) => setIsDaily(Boolean(v))}
          className="hover:cursor-pointer"
        />
        매일 할 일(daily)
      </label>

      <Button
        variant="secondary"
        onClick={handleAdd}
        disabled={loading}
        className="hover:cursor-pointer"
      >
        추가
      </Button>
    </div>
  );
}
