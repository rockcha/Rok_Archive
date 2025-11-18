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
import { Popover, PopoverContent } from "@/shared/ui/popover";
import { Label } from "@/shared/ui/label";
import { Plus, Trash2 } from "lucide-react";
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

const TASK_TYPE_META: Record<
  TaskType,
  {
    label: string;
    desc: string;
    dotClass: string;
    activeClass: string;
    inactiveClass: string;
  }
> = {
  DAILY: {
    label: "DAILY",
    desc: "매일 반복",
    // 초록 점 + 연한 초록 배경
    dotClass: "bg-emerald-400",
    activeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm",
    inactiveClass:
      "bg-muted/40 text-muted-foreground border-muted hover:bg-muted/70",
  },
  DAY: {
    label: "DAY",
    desc: "하루 일정",
    // 핑크/레드 점 + 연한 핑크 배경
    dotClass: "bg-rose-500",
    activeClass: "bg-rose-50 text-rose-700 border-rose-300 shadow-sm",
    inactiveClass:
      "bg-muted/40 text-muted-foreground border-muted hover:bg-muted/70",
  },
  DUE: {
    label: "DUE",
    desc: "마감/기한",
    // 주황 점 + 연한 주황 배경
    dotClass: "bg-amber-400",
    activeClass: "bg-amber-50 text-amber-700 border-amber-300 shadow-sm",
    inactiveClass:
      "bg-muted/40 text-muted-foreground border-muted hover:bg-muted/70",
  },
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
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(["DAY", "DUE", "DAILY"] as TaskType[]).map((t) => {
                const meta = TASK_TYPE_META[t];
                const isActive = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={isActive}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-left text-sm transition-all hover:cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive ? meta.activeClass : meta.inactiveClass
                    )}
                    onClick={() => {
                      setType(t);
                      setTouchedType(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("h-3 w-3 rounded-full", meta.dotClass)}
                      />
                      <span className="font-semibold tracking-wide">
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground sm:block">
                      {meta.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 날짜 (DAILY는 비활성 표시) */}
          <div className="pt-4">
            <Label className="text-xs text-muted-foreground">
              {type === "DUE" ? "마감일" : "날짜"}
            </Label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Popover open={openCal} onOpenChange={setOpenCal}>
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
                  매일 반복 Task는 날짜를 따로 선택하지 않아요.
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
            className="hover:cursor-pointer rounded-full px-6"
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
