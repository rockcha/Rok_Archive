"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { Schedule } from "@/pages/SchedularPage";

type Props = {
  schedule: Schedule | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Omit<Schedule, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ScheduleDialog({
  schedule,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const open = !!schedule;

  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (schedule) {
      setEditing(false);
      setDate(schedule.date);
      setTitle(schedule.title);
      setContent(schedule.content ?? "");
    }
  }, [schedule]);

  const save = async () => {
    if (!schedule) return;
    await onUpdate(schedule.id, { date, title, content });
    setEditing(false);
  };

  const remove = async () => {
    if (!schedule) return;
    if (!confirm("이 일정을 삭제할까요?")) return;
    await onDelete(schedule.id);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        {!schedule ? null : (
          <div className="space-y-4">
            {editing ? (
              <>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{schedule.title}</h3>
                <p className="whitespace-pre-wrap">{schedule.content}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="justify-between">
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="hover:cursor-pointer"
                >
                  수정
                </Button>
                <Button
                  variant="destructive"
                  onClick={remove}
                  className="hover:cursor-pointer"
                >
                  삭제
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="hover:cursor-pointer"
                >
                  취소
                </Button>
                <Button
                  onClick={save}
                  disabled={!title.trim()}
                  className="hover:cursor-pointer"
                >
                  저장
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
