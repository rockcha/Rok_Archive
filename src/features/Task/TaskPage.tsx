// src/pages/TaskPage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  Link as LinkIcon,
  Trash2,
  Calendar as CalendarIcon,
  AlarmClock,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/shared/lib/supabase";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Calendar } from "@/shared/ui/calendar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";

/* Types */
type TaskType = "DAY" | "DUE";
type Task = {
  id: number;
  title: string;
  type: TaskType;
  memo: string | null;
  links: string[];
  is_completed: boolean;
  sort_order: number | null;
  date: string; // 'YYYY-MM-DD'
  created_at: string;
  updated_at: string;
};

/* Utils */
const toYMD = (d: Date) => format(d, "yyyy-MM-dd");

const dday = (targetDateYMD: string) => {
  const today = new Date();
  const target = new Date(targetDateYMD + "T00:00:00");
  const diff = Math.floor(
    (target.getTime() - new Date(toYMD(today) + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return { label: "D-DAY", value: 0 };
  if (diff > 0) return { label: `D-${diff}`, value: diff };
  return { label: `D+${Math.abs(diff)}`, value: diff };
};

const weekdayKR = (d: Date) => format(d, "EEE");
const cn = (...a: (string | false | undefined)[]) =>
  a.filter(Boolean).join(" ");

const faviconUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch (_) {
    return `https://www.google.com/s2/favicons?domain=${raw}&sz=32`;
  }
};

/* DatePicker (shadcn Calendar + Popover) */
function DatePicker({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:cursor-pointer rounded-full"
        >
          <CalendarDays className="w-4 h-4" />
          {format(date, "yyyy.MM.dd")} ({weekdayKR(date)})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (!d) return;
            onChange(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* 색상 유틸: DUE 카드 좌측 띠 */
function dueStripe(dd: { value: number }) {
  if (dd.value === 0) return "border-l-4 border-indigo-400";
  if (dd.value > 0 && dd.value <= 3) return "border-l-4 border-amber-300";
  if (dd.value > 3) return "border-l-4 border-muted";
  return "border-l-4 border-rose-300";
}

export default function TaskPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayTasks, setDayTasks] = useState<Task[]>([]); // 화면 표시 리스트(필터 적용)
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [onlyActive, setOnlyActive] = useState(true);

  // 전체 기준 진행률 계산을 위한 카운트 (필터 무시)
  const [allCount, setAllCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  // 새 Task Dialog 상태
  const [openNew, setOpenNew] = useState(false);
  const [newType, setNewType] = useState<TaskType>("DAY");
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [newTitle, setNewTitle] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [newLinkInput, setNewLinkInput] = useState("");
  const [newLinks, setNewLinks] = useState<string[]>([]);
  const [openNewDatePop, setOpenNewDatePop] = useState(false);

  // 다가오는 Task 상세 모달
  const [openDueDetail, setOpenDueDetail] = useState(false);
  const [dueDetail, setDueDetail] = useState<Task | null>(null);
  const [openDueDatePop, setOpenDueDatePop] = useState(false);

  // 상세 자동저장 디바운스
  const autosaveTimer = useRef<Record<number, any>>({});

  const selectedTask = useMemo(
    () => dayTasks.find((t) => t.id === selectedTaskId) || null,
    [dayTasks, selectedTaskId]
  );

  const progressPct = useMemo(() => {
    if (allCount === 0) return 0;
    return Math.round((doneCount / allCount) * 100);
  }, [allCount, doneCount]);

  /* Fetchers */
  const fetchDayTasks = async (ymd: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("type", "DAY")
      .eq("date", ymd)
      .order("sort_order", { ascending: true });

    if (!error && data) {
      const list = data as Task[];
      // 전체 기준 카운트 업데이트 (필터 무시)
      setAllCount(list.length);
      setDoneCount(list.filter((t) => t.is_completed).length);

      // 화면 표시용은 필터 적용
      const filtered = list.filter((t) =>
        onlyActive ? !t.is_completed : true
      );
      setDayTasks(filtered);

      if (!filtered.find((t) => t.id === selectedTaskId)) {
        setSelectedTaskId(filtered.length ? filtered[0].id : null);
      }
    }
  };

  const fetchDueTasks = async () => {
    const todayYMD = toYMD(new Date());
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("type", "DUE")
      .gte("date", todayYMD)
      .order("date", { ascending: true });
    if (!error && data) setDueTasks(data as Task[]);
  };

  useEffect(() => {
    const ymd = toYMD(selectedDate);
    fetchDayTasks(ymd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, onlyActive]);

  useEffect(() => {
    fetchDueTasks();
  }, []);

  /* Autosave */
  const scheduleAutosave = (task: Task, patch: Partial<Task>) => {
    // 화면 리스트에도 반영
    setDayTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t))
    );
    // 진행률 카운트는 상태 변경에 따라 즉시 조정 (완료 토글 등)
    if (typeof patch.is_completed === "boolean") {
      setDoneCount((prev) => prev + (patch.is_completed ? 1 : -1));
    }
    if (autosaveTimer.current[task.id])
      clearTimeout(autosaveTimer.current[task.id]);
    autosaveTimer.current[task.id] = setTimeout(async () => {
      await supabase.from("tasks").update(patch).eq("id", task.id);
    }, 500);
  };

  const toggleComplete = (task: Task) =>
    scheduleAutosave(task, { is_completed: !task.is_completed });

  const deleteTask = async (task: Task) => {
    await supabase.from("tasks").delete().eq("id", task.id);
    const ymd = toYMD(selectedDate);
    setSelectedTaskId(null);
    // 삭제 반영: 전체 카운트와 완료 카운트도 즉시 조정
    setAllCount((c) => Math.max(0, c - 1));
    if (task.is_completed) setDoneCount((c) => Math.max(0, c - 1));
    await Promise.all([fetchDayTasks(ymd), fetchDueTasks()]);
  };

  const addLink = (task: Task, url: string) => {
    if (!url.trim()) return;
    const newLinks = [...(task.links || []), url.trim()];
    scheduleAutosave(task, { links: newLinks });
  };
  const removeLink = (task: Task, idx: number) => {
    const newLinks = (task.links || []).filter((_, i) => i !== idx);
    scheduleAutosave(task, { links: newLinks });
  };

  /* Drag & Drop (DAY 정렬 + DUE → DAY 변환 지원) */
  const onDragStartDay =
    (task: Task, index: number) => (e: React.DragEvent) => {
      e.dataTransfer.setData(
        "application/x-task-source",
        JSON.stringify({ list: "DAY", id: task.id, index })
      );
      e.dataTransfer.effectAllowed = "move";
    };

  const onDragStartDue = (task: Task) => (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/x-task-source",
      JSON.stringify({ list: "DUE", id: task.id })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const allowMove = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDropDayContainer = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-task-source");
    if (!raw) return;
    const info = JSON.parse(raw) as {
      list: "DAY" | "DUE";
      id: number;
      index?: number;
    };
    if (info.list !== "DUE") return;
    const ymd = toYMD(selectedDate);
    supabase
      .from("tasks")
      .update({ type: "DAY", date: ymd, sort_order: null })
      .eq("id", info.id)
      .then(async ({ error }) => {
        if (!error) await Promise.all([fetchDayTasks(ymd), fetchDueTasks()]);
      });
  };

  const onDropDayReorder = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-task-source");
    if (!raw) return;
    const info = JSON.parse(raw) as {
      list: "DAY" | "DUE";
      id: number;
      index?: number;
    };
    const ymd = toYMD(selectedDate);

    if (info.list === "DUE") {
      supabase
        .from("tasks")
        .update({ type: "DAY", date: ymd, sort_order: null })
        .eq("id", info.id)
        .then(async ({ error }) => {
          if (!error) await Promise.all([fetchDayTasks(ymd), fetchDueTasks()]);
        });
      return;
    }

    const fromIndex = info.index ?? -1;
    if (fromIndex === toIndex || fromIndex < 0) return;

    const next = [...dayTasks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDayTasks(next);

    Promise.all(
      next.map((t, i) =>
        supabase
          .from("tasks")
          .update({ sort_order: i + 1 })
          .eq("id", t.id)
      )
    ).then(() => fetchDayTasks(ymd));
  };

  /* 새 Task Dialog */
  const resetNewForm = () => {
    setNewType("DAY");
    setNewDate(selectedDate);
    setNewTitle("");
    setNewMemo("");
    setNewLinks([]);
    setNewLinkInput("");
    setOpenNewDatePop(false);
  };

  const createTask = async () => {
    const payload = {
      title: newTitle || "(제목 없음)",
      type: newType,
      date: toYMD(newDate),
      memo: newMemo,
      links: newLinks,
      sort_order: null,
      is_completed: false,
    };
    const { error } = await supabase.from("tasks").insert(payload);
    if (!error) {
      setOpenNew(false);
      resetNewForm();
      const ymd = toYMD(selectedDate);
      await Promise.all([fetchDayTasks(ymd), fetchDueTasks()]);
    }
  };

  /* 오늘로 버튼 */
  const setToday = () => setSelectedDate(new Date());

  /* 상세에서 DUE로 변경 */
  const setSelectedAsDue = async (deadline: Date) => {
    if (!selectedTask) return;
    const y = toYMD(deadline);
    await supabase
      .from("tasks")
      .update({ type: "DUE", date: y, sort_order: null })
      .eq("id", selectedTask.id);
    setSelectedTaskId(null);
    await Promise.all([fetchDayTasks(toYMD(selectedDate)), fetchDueTasks()]);
  };

  /* 다가오는 Task 클릭 → 상세 모달 */
  const openDueTaskDetail = (t: Task) => {
    setDueDetail(t);
    setOpenDueDetail(true);
    setOpenDueDatePop(false);
  };

  const autosaveDueDetail = (patch: Partial<Task>) => {
    if (!dueDetail) return;
    const next = { ...dueDetail, ...patch } as Task;
    setDueDetail(next);
    if (autosaveTimer.current[-1]) clearTimeout(autosaveTimer.current[-1]);
    autosaveTimer.current[-1] = setTimeout(async () => {
      await supabase.from("tasks").update(patch).eq("id", next.id);
      await fetchDueTasks();
      if (patch.type === "DAY" || patch.date) {
        await fetchDayTasks(toYMD(selectedDate));
      }
    }, 500);
  };

  const deleteDueTask = async () => {
    if (!dueDetail) return;
    await supabase.from("tasks").delete().eq("id", dueDetail.id);
    setOpenDueDetail(false);
    setDueDetail(null);
    await Promise.all([fetchDueTasks(), fetchDayTasks(toYMD(selectedDate))]);
  };

  /* Render */
  const selectedDateStr = format(selectedDate, "yyyy.MM.dd");

  return (
    <div className="p-6 max-w-[1400px] mx-auto bg-muted/20">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Task 관리하기
        </h1>
      </div>

      {/* 컨트롤 라인 */}
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-base md:text-lg font-medium text-foreground/90">
            📅 {selectedDateStr} ({weekdayKR(selectedDate)})
          </div>
          <DatePicker date={selectedDate} onChange={setSelectedDate} />
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full px-3 py-1 hover:cursor-pointer"
            onClick={setToday}
          >
            오늘
          </Button>
        </div>

        {/* 새 Task 추가 */}
        <Dialog
          open={openNew}
          onOpenChange={(o) => {
            setOpenNew(o);
            if (o) setNewDate(selectedDate);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full gap-2 hover:cursor-pointer"
              onClick={() => {
                resetNewForm();
                setOpenNew(true);
              }}
            >
              <Plus className="w-4 h-4" /> 새 Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4" /> 새 Task 추가
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-2 divide-y divide-muted/30">
              {/* 유형 */}
              <div className="pt-1">
                <Label className="text-xs text-muted-foreground">유형</Label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition hover:cursor-pointer",
                      newType === "DAY"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-muted"
                    )}
                    onClick={() => setNewType("DAY")}
                  >
                    DAY
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition hover:cursor-pointer",
                      newType === "DUE"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-muted"
                    )}
                    onClick={() => setNewType("DUE")}
                  >
                    DUE
                  </button>
                </div>
              </div>

              {/* 날짜 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">날짜</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Popover
                    open={openNewDatePop}
                    onOpenChange={setOpenNewDatePop}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2"
                      >
                        <CalendarDays className="w-4 h-4" />
                        달력 선택
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={(d) => {
                          if (!d) return;
                          setNewDate(d);
                          setOpenNewDatePop(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="date"
                    value={toYMD(newDate)}
                    onChange={(e) => {
                      const v = e.target.value;
                      const [y, m, d] = v.split("-").map(Number);
                      if (!y || !m || !d) return;
                      setNewDate(new Date(y, m - 1, d));
                    }}
                    className="w-[160px]"
                  />
                </div>
              </div>

              {/* 제목 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">제목</Label>
                <Input
                  className="mt-2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </div>

              {/* 메모 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">메모</Label>
                <Textarea
                  rows={4}
                  className="mt-2 text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 font-gowun"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="세부 메모"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </div>

              {/* 링크 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">링크</Label>
                <div className="mt-2 space-y-2">
                  {newLinks.map((link, idx) => (
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
                          setNewLinks((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 border border-dashed border-muted rounded-xl p-2">
                    <Input
                      value={newLinkInput}
                      onChange={(e) => setNewLinkInput(e.target.value)}
                      placeholder="https:// 링크 추가"
                    />
                    <Button
                      variant="outline"
                      className="gap-2 hover:cursor-pointer"
                      onClick={() => {
                        if (!newLinkInput.trim()) return;
                        setNewLinks((prev) => [...prev, newLinkInput.trim()]);
                        setNewLinkInput("");
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
                onClick={createTask}
              >
                등록
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: 오늘의 Task */}
        <section className="col-span-12 lg:col-span-8">
          {/* 상세 (상태 관련 UI 제거, 중립 헤더) */}
          <Card className="mb-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white">
              <CardTitle className="text-xl flex items-center gap-3">
                Task 상세보기
              </CardTitle>

              {selectedTask && (
                <div className="flex items-center gap-2">
                  {/* 완료/미완료 토글 제거됨 */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 hover:cursor-pointer rounded-full"
                      >
                        <AlarmClock className="w-4 h-4" />
                        DUE 로 변경
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={new Date()}
                        onSelect={(d) => d && setSelectedAsDue(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2 hover:cursor-pointer rounded-full"
                    onClick={() => deleteTask(selectedTask)}
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-5">
              {selectedTask ? (
                <div className="space-y-5">
                  {/* 제목 */}
                  <div className="space-y-1 border-l-4 border-primary/20 pl-3">
                    <label className="text-xs text-muted-foreground">
                      제목
                    </label>
                    <Input
                      value={selectedTask.title}
                      onChange={(e) =>
                        scheduleAutosave(selectedTask, {
                          title: e.target.value,
                        })
                      }
                      placeholder="제목을 입력하세요"
                    />
                  </div>

                  {/* 메모 */}
                  <div className="space-y-1 border-l-4 border-primary/20 pl-3">
                    <label className="text-xs text-muted-foreground">
                      메모
                    </label>
                    <Textarea
                      rows={6}
                      className="text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 font-gowun rounded-xl"
                      value={selectedTask.memo || ""}
                      onChange={(e) =>
                        scheduleAutosave(selectedTask, { memo: e.target.value })
                      }
                      placeholder="세부 메모를 적어주세요"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      autoComplete="off"
                    />
                  </div>

                  {/* 링크 */}
                  <div className="space-y-1 border-l-4 border-primary/20 pl-3">
                    <label className="text-xs text-muted-foreground">
                      링크
                    </label>
                    <div className="space-y-2">
                      {(selectedTask.links || []).map((link, idx) => (
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
                            <LinkIcon className="w-4 h-4 inline mr-1 opacity-80" />
                            {link}
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:cursor-pointer"
                            onClick={() => removeLink(selectedTask, idx)}
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <AddLinkRow onAdd={(url) => addLink(selectedTask, url)} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  아래 목록에서 당일 Task를 선택하세요.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 목록 (DAY 정렬 + DUE 드롭 허용) */}
          <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-2xl">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xl">오늘의 Task</CardTitle>

                {/* 우측: 필터 버튼들 (새로고침 제거) */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={onlyActive ? "default" : "outline"}
                    className="h-8 px-3 hover:cursor-pointer rounded-full"
                    onClick={() => setOnlyActive(true)}
                  >
                    미완료만
                  </Button>
                  <Button
                    variant={onlyActive ? "outline" : "default"}
                    className="h-8 px-3 hover:cursor-pointer rounded-full"
                    onClick={() => setOnlyActive(false)}
                  >
                    전체보기
                  </Button>
                </div>
              </div>

              {/* 진행률 바: 항상 전체 기준 완료/전체 */}
              <div className="w-full">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                    aria-label={`완료율 ${progressPct}%`}
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {doneCount} / {allCount} 완료
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div
                onDragOver={allowMove}
                onDrop={onDropDayContainer}
                className="rounded-2xl p-2"
              >
                {dayTasks.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    선택한 날짜에 당일 Task가 없습니다. 오른쪽에서 드래그해서
                    추가할 수 있어요.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dayTasks.map((t, idx) => (
                      <button
                        key={t.id}
                        draggable
                        onDragStart={onDragStartDay(t, idx)}
                        onDragOver={allowMove}
                        onDrop={onDropDayReorder(idx)}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={cn(
                          "relative aspect-square rounded-2xl border flex flex-col items-center justify-center p-3 transition-colors",
                          "hover:cursor-pointer",
                          t.is_completed
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-rose-50 border-rose-100",
                          selectedTaskId === t.id
                            ? "ring-2 ring-offset-2 ring-primary/50 outline-none"
                            : ""
                        )}
                        title="드래그로 순서 변경 / 클릭으로 선택"
                      >
                        {/* 우측 상단 체크 버튼 (완료 토글) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(t);
                          }}
                          className={cn(
                            "absolute top-2 right-2 h-7 w-7 rounded-full border flex items-center justify-center shadow-sm",
                            t.is_completed
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-white/90 text-foreground/70 border-muted hover:bg-white"
                          )}
                          aria-label={t.is_completed ? "완료 해제" : "완료"}
                          title={t.is_completed ? "완료 해제" : "완료"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <div
                          className={cn(
                            "font-medium text-center line-clamp-3 px-2",
                            t.is_completed && "opacity-90"
                          )}
                        >
                          {t.title || "(제목 없음)"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* RIGHT: 다가오는 Task */}
        <aside className="col-span-12 lg:col-span-4">
          <Card className="shadow-[0_1px_4px_rgba(0,0,0,0.05)] rounded-2xl h-[720px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">다가오는 Task</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[600px] pr-2 bg-muted/10 rounded-xl">
                <div className="p-2 space-y-3">
                  {dueTasks.length === 0 ? (
                    <div className="text-sm text-muted-foreground px-2">
                      다가오는 기한 제한 Task가 없습니다.
                    </div>
                  ) : (
                    dueTasks.map((t) => {
                      const d = dday(t.date);
                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={onDragStartDue(t)}
                          onClick={() => openDueTaskDetail(t)}
                          className={cn(
                            "rounded-xl border p-4 transition-all hover:cursor-pointer bg-white/80",
                            "hover:-translate-x-0.5 hover:shadow-sm",
                            dueStripe(d)
                          )}
                          title="왼쪽으로 드래그해서 오늘의 Task로 이동하거나 클릭해서 상세 보기"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {t.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {format(
                                  new Date(t.date + "T00:00:00"),
                                  "yyyy.MM.dd"
                                )}{" "}
                                ({weekdayKR(new Date(t.date + "T00:00:00"))})
                              </div>
                            </div>
                            <div
                              className={cn(
                                "text-xs px-2 py-1 rounded-full whitespace-nowrap",
                                d.value === 0
                                  ? "bg-indigo-100 text-indigo-700"
                                  : d.value > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                              )}
                            >
                              {d.label}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* 다가오는 Task 상세 Dialog (현행 유지) */}
      <Dialog open={openDueDetail} onOpenChange={setOpenDueDetail}>
        <DialogContent className="sm:max-w-[620px] bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <AlarmClock className="w-4 h-4" />
              DUE Task 상세
            </DialogTitle>
          </DialogHeader>

          {dueDetail && (
            <div className="grid gap-5 py-2 divide-y divide-muted/30">
              {/* 유형 변경 */}
              <div className="pt-1">
                <Label className="text-xs text-muted-foreground">유형</Label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition hover:cursor-pointer",
                      dueDetail.type === "DAY"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-muted"
                    )}
                    onClick={() => {
                      // DAY로 전환 시 기본 날짜는 좌측 선택일로
                      autosaveDueDetail({
                        type: "DAY",
                        date: toYMD(selectedDate),
                        sort_order: null,
                      });
                    }}
                  >
                    DAY
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition hover:cursor-pointer",
                      dueDetail.type === "DUE"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-muted"
                    )}
                    onClick={() => {
                      // DUE로 전환: 날짜는 유지
                      autosaveDueDetail({ type: "DUE", sort_order: null });
                    }}
                  >
                    DUE
                  </button>
                </div>
              </div>

              {/* 상태 (DUE 상세는 유지) */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">상태</span>
                <button
                  onClick={() =>
                    autosaveDueDetail({ is_completed: !dueDetail.is_completed })
                  }
                  className={cn(
                    "text-xs px-3 py-1 rounded-full border transition hover:cursor-pointer",
                    dueDetail.is_completed
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
                  )}
                >
                  {dueDetail.is_completed ? "완료됨" : "미완료"}
                </button>
              </div>

              {/* 날짜 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">
                  {dueDetail.type === "DAY" ? "날짜(당일)" : "마감일"}
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <Popover
                    open={openDueDatePop}
                    onOpenChange={setOpenDueDatePop}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full gap-2"
                      >
                        <CalendarDays className="w-4 h-4" />
                        달력 선택
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(dueDetail.date + "T00:00:00")}
                        onSelect={(d) => {
                          if (!d) return;
                          autosaveDueDetail({ date: toYMD(d) });
                          setOpenDueDatePop(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="date"
                    value={dueDetail.date}
                    onChange={(e) =>
                      autosaveDueDetail({ date: e.target.value })
                    }
                    className="w-[160px]"
                  />

                  <Button
                    variant="secondary"
                    className="hover:cursor-pointer rounded-full"
                    onClick={() =>
                      autosaveDueDetail({ date: toYMD(selectedDate) })
                    }
                  >
                    선택 날짜로
                  </Button>
                </div>
              </div>

              {/* 제목 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">제목</Label>
                <Input
                  className="mt-2"
                  value={dueDetail.title}
                  onChange={(e) => autosaveDueDetail({ title: e.target.value })}
                />
              </div>

              {/* 메모 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">메모</Label>
                <Textarea
                  rows={4}
                  className="mt-2 text-sm bg-muted/20 border-none focus:ring-1 focus:ring-primary/30 font-gowun"
                  value={dueDetail.memo || ""}
                  onChange={(e) => autosaveDueDetail({ memo: e.target.value })}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </div>

              {/* 링크 */}
              <div className="pt-4">
                <Label className="text-xs text-muted-foreground">링크</Label>
                <DueLinksEditor
                  task={dueDetail}
                  onChange={(links) => autosaveDueDetail({ links })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="destructive"
                  className="gap-2 hover:cursor-pointer rounded-full"
                  onClick={deleteDueTask}
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* 다가오는 Task 링크 에디터 */
function DueLinksEditor({
  task,
  onChange,
}: {
  task: Task;
  onChange: (links: string[]) => void;
}) {
  const [linkInput, setLinkInput] = useState("");
  const links = task.links || [];
  return (
    <div className="space-y-2">
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
            <LinkIcon className="w-4 h-4 inline mr-1 opacity-80" />
            {link}
          </a>
          <Button
            size="icon"
            variant="ghost"
            className="hover:cursor-pointer"
            onClick={() => onChange(links.filter((_, i) => i !== idx))}
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
            onChange([...links, linkInput.trim()]);
            setLinkInput("");
          }}
        >
          <Plus className="w-4 h-4" /> 추가
        </Button>
      </div>
    </div>
  );
}

/* 하단: 링크 추가 행 컴포넌트 (DAY 상세) */
function AddLinkRow({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex items-center gap-2 border border-dashed border-muted rounded-xl p-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https:// 링크 추가"
      />
      <Button
        variant="outline"
        onClick={() => {
          if (!url.trim()) return;
          onAdd(url);
          setUrl("");
        }}
        className="gap-2 hover:cursor-pointer"
      >
        <Plus className="w-4 h-4" /> 추가
      </Button>
    </div>
  );
}
