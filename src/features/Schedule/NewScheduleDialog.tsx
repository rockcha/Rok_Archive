"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { Schedule } from "@/pages/SchedularPage";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate: string; // "YYYY-MM-DD"
  onCreate: (payload: Omit<Schedule, "id">) => Promise<void>;
};

export function NewScheduleDialog({
  open,
  onOpenChange,
  defaultDate,
  onCreate,
}: Props) {
  const [date, setDate] = useState(defaultDate);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate({ date, title: title.trim(), content });
      setTitle("");
      setContent("");
      setDate(defaultDate);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 일정 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 운동, 공부, 모임…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={submit} disabled={saving || !title.trim()}>
            {saving ? "저장 중…" : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
