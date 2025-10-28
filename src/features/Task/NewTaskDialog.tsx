"use client";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Calendar } from "@/shared/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Label } from "@/shared/ui/label";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import type { TaskType } from "./types";
import { toYMD, cn, faviconUrl } from "./utils";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate: Date;
  onCreate: (payload: {
    title: string;
    type: TaskType;
    date: string;
    memo: string | null;
    links: string[];
  }) => Promise<void>;
};

export default function NewTaskDialog({
  open,
  onOpenChange,
  defaultDate,
  onCreate,
}: Props) {
  const [type, setType] = useState<TaskType>("DAY");
  const [date, setDate] = useState<Date>(defaultDate);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [openCal, setOpenCal] = useState(false);

  const [touchedType, setTouchedType] = useState(false);

  const reset = () => {
    setType("DAY");
    setDate(defaultDate);
    setTitle("");
    setMemo("");
    setLinks([]);
    setLinkInput("");
    setOpenCal(false);
    setTouchedType(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            새 Task 추가
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2 divide-y divide-muted/30">
          {/* 유형 */}
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">유형</Label>
            <div className="mt-2 flex items-center gap-2">
              {(["DAY", "DUE", "DAILY"] as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition hover:cursor-pointer",
                    type === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-muted"
                  )}
                  onClick={() => {
                    setType(t);
                    setTouchedType(true);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 (DAILY는 비활성 표시) */}
          <div className="pt-4">
            <Label className="text-xs text-muted-foreground">
              {type === "DUE" ? "마감일" : "날짜"}
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Popover open={openCal} onOpenChange={setOpenCal}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2"
                    disabled={type === "DAILY"}
                  >
                    <CalendarDays className="w-4 h-4" />
                    달력 선택
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (!d) return;
                      setDate(d);
                      setOpenCal(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="date"
                value={toYMD(date)}
                onChange={(e) => {
                  const v = e.target.value;
                  const [y, m, d] = v.split("-").map(Number);
                  if (!y || !m || !d) return;
                  setDate(new Date(y, m - 1, d));
                }}
                className="w-[160px]"
                disabled={type === "DAILY"}
              />
              {type === "DAILY" && (
                <span className="text-xs text-muted-foreground">
                  매일 반복(날짜 선택 불가)
                </span>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="pt-4">
            <Label className="text-xs text-muted-foreground">제목</Label>
            <Input
              className="mt-2"
              value={title}
              onChange={(e) => {
                const v = e.target.value;
                setTitle(v);

                if (!touchedType) {
                  const dailyHints = [
                    "운동",
                    "영어",
                    "복습",
                    "스트레칭",
                    "명상",
                    "독서",
                  ];
                  const dueHints = [
                    "제출",
                    "마감",
                    "deadline",
                    "신청",
                    "과제",
                    "납부",
                  ];
                  if (dailyHints.some((k) => v.includes(k))) setType("DAILY");
                  else if (dueHints.some((k) => v.includes(k))) setType("DUE");
                  else setType("DAY");
                }
              }}
              placeholder="제목"
            />
          </div>

          {/* 메모 */}
          <div className="pt-4">
            <Label className="text-xs text-muted-foreground">메모</Label>
            <Textarea
              rows={4}
              className="mt-2 text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 font-gowun"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="세부 메모"
              spellCheck={false}
            />
          </div>

          {/* 링크 */}
          <div className="pt-4">
            <Label className="text-xs text-muted-foreground">링크</Label>
            <div className="mt-2 space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <img
                    src={faviconUrl(link)}
                    alt=""
                    className="w-4 h-4 rounded-sm opacity-80"
                  />
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate underline decoration-dotted text-primary flex-1"
                    title={link}
                  >
                    {link}
                  </a>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:cursor-pointer"
                    onClick={() =>
                      setLinks((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 border border-dashed border-muted rounded-xl p-2">
                <Input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https:// 링크 추가"
                />
                <Button
                  variant="outline"
                  className="gap-2 hover:cursor-pointer"
                  onClick={() => {
                    if (!linkInput.trim()) return;
                    setLinks((prev) => [...prev, linkInput.trim()]);
                    setLinkInput("");
                  }}
                >
                  <Plus className="w-4 h-4" /> 추가
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="hover:cursor-pointer rounded-full"
            onClick={async () => {
              await onCreate({
                title: title || "(제목 없음)",
                type,
                date: toYMD(date),
                memo: memo || null,
                links,
              });
              onOpenChange(false);
              reset();
            }}
          >
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
