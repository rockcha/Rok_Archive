// src/features/tasks/TaskPage.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { CalendarDays, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Task, Schedule } from "./types";
import { weekdayKR, toYMD } from "./utils";
import {
  fetchDayTasksByDate,
  fetchDueTasksFrom,
  fetchDailyTasks,
  createTask as apiCreate,
  updateTask,
  deleteTaskRow,
  fetchSchedulesInRange,
  fetchUpcomingSchedules,
  fetchDayTasksInRange,
  fetchDueTasksInRange,
  fetchDailyMemo,
  upsertDailyMemo,
} from "./api";

import NewTaskDialog from "./NewTaskDialog";
import TaskDetail from "./TaskDetail";
import CalendarPanel from "./CalendarPanel";
import { Calendar } from "@/shared/ui/calendar";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import TodayListAside from "./TodayListAside";

type Tab = "LIST" | "CAL";
type TimeoutId = ReturnType<typeof setTimeout>;

export default function TaskPage() {
  const [tab, setTab] = useState<Tab>("LIST");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 데이터
  const [daily, setDaily] = useState<Task[]>([]);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // 새 Task
  const [openNew, setOpenNew] = useState(false);

  // 캘린더 모드 오른쪽: 선택 날짜 스케쥴
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);

  // 월 범위 맵
  const [monthMap, setMonthMap] = useState<
    Record<
      string,
      { day: Task[]; due: Task[]; daily: Task[]; schedule?: number }
    >
  >({});

  // 날짜 선택 다이얼로그 (LIST 모드)
  const [openDatePick, setOpenDatePick] = useState(false);
  const [datePickValue, setDatePickValue] = useState<Date>(new Date());
  const [dateInput, setDateInput] = useState<string>(toYMD(new Date()));

  // LIST 우측 탭용: 다가오는 스케줄
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);

  const autosaveTimer = useRef<Record<number, TimeoutId | null>>({});

  // Daily Memo
  const [dailyMemo, setDailyMemo] = useState("");
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [memoJustSaved, setMemoJustSaved] = useState(false);
  const [memoSavedAt, setMemoSavedAt] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy.MM.dd");
  const selectedYMD = toYMD(selectedDate);

  // ⭐ selectedTask 만들 때 DAILY + DAY + DUE 모두 포함
  const selectedTask = useMemo(
    () =>
      [...daily, ...dayTasks, ...dueTasks].find(
        (t) => t.id === selectedTaskId
      ) || null,
    [daily, dayTasks, dueTasks, selectedTaskId]
  );

  /* Fetchers */
  const reloadDaily = async () => setDaily(await fetchDailyTasks());

  const reloadDay = async (ymd: string) => {
    const list = await fetchDayTasksByDate(ymd);
    setDayTasks(list);
    // 날짜 바뀔 때 이전 선택 클리어
    if (!list.find((t) => t.id === selectedTaskId)) setSelectedTaskId(null);
  };

  const reloadDue = async () =>
    setDueTasks(await fetchDueTasksFrom(toYMD(new Date())));

  // 초기 로딩
  useEffect(() => {
    const ymd = selectedYMD;
    Promise.all([reloadDaily(), reloadDay(ymd), reloadDue()]);
    (async () => {
      setUpcomingSchedules(await fetchUpcomingSchedules(30));
      // 월맵 로드(현재 달)
      const start = toYMD(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
      const end = toYMD(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      );
      await loadMonthMap(start, end);
      // 우측 패널 스케쥴
      setSelectedSchedules(await fetchSchedulesInRange(ymd, ymd));

      // 오늘 Daily Memo 로드
      const memo = await fetchDailyMemo(ymd);
      setDailyMemo(memo?.content ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 날짜 변경 시 DAY + 스케줄 + Daily Memo 갱신
  useEffect(() => {
    const ymd = selectedYMD;
    (async () => {
      await reloadDay(ymd);
      setSelectedSchedules(await fetchSchedulesInRange(ymd, ymd));
      const memo = await fetchDailyMemo(ymd);
      setDailyMemo(memo?.content ?? "");
      setMemoJustSaved(false);
      setMemoSavedAt(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadMonthMap = async (startYMD: string, endYMD: string) => {
    const [dayRange, dueRange, dailyList] = await Promise.all([
      fetchDayTasksInRange(startYMD, endYMD),
      fetchDueTasksInRange(startYMD, endYMD),
      fetchDailyTasks(),
    ]);
    const m: Record<string, { day: Task[]; due: Task[]; daily: Task[] }> = {};
    dayRange.forEach((t) => {
      if (!m[t.date]) m[t.date] = { day: [], due: [], daily: dailyList };
      m[t.date].day.push(t);
    });
    dueRange.forEach((t) => {
      if (!m[t.date]) m[t.date] = { day: [], due: [], daily: dailyList };
      m[t.date].due.push(t);
    });
    // 범위 내 모든 날짜에 daily 채워넣기
    const s = new Date(startYMD + "T00:00:00");
    const e = new Date(endYMD + "T00:00:00");
    for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
      const k = toYMD(cur);
      if (!m[k]) m[k] = { day: [], due: [], daily: dailyList };
    }
    setMonthMap(m);
  };

  /* Autosave for Task */
  const scheduleAutosave = (task: Task, patch: Partial<Task>) => {
    const updateLocal = (arr: Task[]) =>
      arr.map((t) => (t.id === task.id ? { ...t, ...patch } : t));
    setDayTasks((prev) => updateLocal(prev));
    setDaily((prev) => updateLocal(prev));
    setDueTasks((prev) => updateLocal(prev));

    const prevTimer = autosaveTimer.current[task.id];
    if (prevTimer) clearTimeout(prevTimer);
    autosaveTimer.current[task.id] = setTimeout(async () => {
      await updateTask(task.id, patch);
      autosaveTimer.current[task.id] = null;
    }, 400);
  };

  const deleteTask = async (task: Task) => {
    await deleteTaskRow(task.id);
    setSelectedTaskId(null);
    await Promise.all([
      reloadDay(toYMD(selectedDate)),
      reloadDue(),
      reloadDaily(),
    ]);
  };

  // Daily Memo 저장
  const handleSaveMemo = async () => {
    try {
      setIsSavingMemo(true);
      setMemoJustSaved(false);

      await upsertDailyMemo({
        date: selectedYMD,
        content: dailyMemo,
      });

      const now = new Date();
      setMemoSavedAt(format(now, "HH:mm:ss"));
      setMemoJustSaved(true);

      setTimeout(() => {
        setMemoJustSaved(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      window.alert("메모 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingMemo(false);
    }
  };

  // 날짜 선택 다이얼로그
  const openDateDialog = () => {
    setDatePickValue(selectedDate);
    setDateInput(toYMD(selectedDate));
    setOpenDatePick(true);
  };
  const handleDateInput = (v: string) => {
    setDateInput(v);
    const [y, m, d] = v.split("-").map(Number);
    if (y && m && d) setDatePickValue(new Date(y, m - 1, d));
  };
  const applyPickedDate = () => {
    setSelectedDate(new Date(datePickValue));
    setOpenDatePick(false);
  };

  // ✅ 선택된 날짜의 DUE (CAL 모드 오른쪽 요약에서 사용)
  const dueToday = useMemo(
    () => dueTasks.filter((t) => t.date === toYMD(selectedDate)),
    [dueTasks, selectedDate]
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto bg-muted/20 relative">
      {/* 상단: 슬라이드 토글 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Task 관리하기
        </h1>

        <div className="relative bg-white border rounded-full p-1 flex items-center gap-1">
          <div className="relative w-[220px] grid grid-cols-2">
            <AnimatePresence initial={false}>
              <motion.div
                key={tab}
                layout
                className="absolute top-0 bottom-0 w-1/2 rounded-full bg-primary/10"
                animate={{ x: tab === "LIST" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </AnimatePresence>
            <button
              className={`z-10 py-1.5 text-sm rounded-full cursor-pointer ${
                tab === "LIST" ? "text-primary font-medium" : "text-neutral-600"
              }`}
              onClick={() => setTab("LIST")}
            >
              목록 모드
            </button>
            <button
              className={`z-10 py-1.5 text-sm rounded-full cursor-pointer ${
                tab === "CAL" ? "text-primary font-medium" : "text-neutral-600"
              }`}
              onClick={() => setTab("CAL")}
            >
              캘린더 모드
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "CAL" ? (
          /* === CAL MODE === */
          <motion.div
            key="CAL"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* 좌: 캘린더 */}
            <section className="col-span-12 lg:col-span-8">
              <CalendarPanel
                monthMap={monthMap}
                selectedYMD={toYMD(selectedDate)}
                onPickDate={(ymd) =>
                  setSelectedDate(new Date(ymd + "T00:00:00"))
                }
                onRangeChange={loadMonthMap}
              />
            </section>

            {/* 우: 요약 패널 */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {format(selectedDate, "yyyy.MM.dd")} (
                    {weekdayKR(selectedDate)})
                  </CardTitle>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                    <Legend label="DAILY" tone="emerald" />
                    <Legend label="DAY" tone="rose" />
                    <Legend label="DUE" tone="amber" />
                    <Legend label="SCHEDULE" tone="indigo" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <SectionTitle label="DAILY" desc="매일 하는 일" />
                  <TitleOnlyList
                    items={daily.map((t) => t.title || "(제목 없음)")}
                    tone="emerald"
                    emptyText="등록된 DAILY가 없습니다."
                  />

                  <SectionTitle label="DAY" desc="선택 날짜의 해야할 일" />
                  <TitleOnlyList
                    items={dayTasks.map((t) => t.title || "(제목 없음)")}
                    tone="rose"
                    emptyText="해당 날짜의 DAY가 없습니다."
                  />

                  <SectionTitle label="DUE" desc="해당 날짜에 마감하는 일" />
                  <TitleOnlyList
                    items={dueToday.map((t) => t.title || "(제목 없음)")}
                    tone="amber"
                    emptyText="해당 날짜의 DUE가 없습니다."
                  />

                  <SectionTitle label="SCHEDULE" desc="선택 날짜 일정" />
                  <TitleOnlyList
                    items={selectedSchedules.map(
                      (s) => s.title || "(제목 없음)"
                    )}
                    tone="indigo"
                    emptyText="해당 날짜의 일정이 없습니다."
                  />
                </CardContent>
              </Card>
            </aside>
          </motion.div>
        ) : (
          /* === LIST MODE === */
          <motion.div
            key="LIST"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* LEFT: main */}
            <section className="col-span-12 lg:col-span-8">
              {/* 1) Daily Memo */}
              <Card className="mb-4 rounded-2xl">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    📝 {selectedDateStr} ({weekdayKR(selectedDate)})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      className="rounded-full cursor-pointer"
                    >
                      오늘
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openDateDialog}
                      className="rounded-full cursor-pointer"
                    >
                      날짜 변경
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">
                        오늘의 메모
                      </span>
                      <Button
                        size="sm"
                        onClick={handleSaveMemo}
                        disabled={isSavingMemo}
                        className="rounded-full cursor-pointer flex items-center gap-1"
                      >
                        {isSavingMemo ? (
                          "저장 중..."
                        ) : memoJustSaved ? (
                          <>
                            <Check className="w-4 h-4" />
                            저장됨
                          </>
                        ) : (
                          "메모 저장"
                        )}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Textarea
                        value={dailyMemo}
                        onChange={(e) => setDailyMemo(e.target.value)}
                        placeholder="오늘의 메모를 자유롭게 적어보세요."
                        className="min-h-[140px] resize-none"
                      />
                      {memoSavedAt && (
                        <p className="text-xs text-muted-foreground text-right">
                          최근 저장: {memoSavedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2) 상세보기 */}
              <Card className="rounded-2xl overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">📌 상세보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskDetail
                    task={selectedTask}
                    onPatch={(p) =>
                      selectedTask && scheduleAutosave(selectedTask, p)
                    }
                    onDelete={() => {
                      if (!selectedTask) return;
                      const ok = window.confirm("정말 삭제하시겠습니까?");
                      if (!ok) return;
                      deleteTask(selectedTask);
                    }}
                  />
                </CardContent>
              </Card>
            </section>

            {/* RIGHT: 오늘 목록(탭 포함) */}
            <aside className="col-span-12 lg:col-span-4">
              <TodayListAside
                daily={daily}
                dayTasks={dayTasks}
                dueToday={dueTasks.filter(
                  (t) => t.date === toYMD(selectedDate)
                )}
                upcomingDue={dueTasks.filter(
                  (t) => t.date !== toYMD(selectedDate)
                )}
                upcomingSchedules={upcomingSchedules}
                selectedId={selectedTaskId}
                onSelect={(id: number) => {
                  // ⭐ 어떤 타입이든 그냥 선택된 id만 저장
                  setSelectedTaskId(id);
                }}
                onToggle={async (id: number, next: boolean) => {
                  await updateTask(id, { is_completed: next });
                  await Promise.all([
                    reloadDay(toYMD(selectedDate)),
                    reloadDue(),
                    reloadDaily(),
                  ]); // DAILY 반영 포함
                }}
                onOpenSchedule={() => {
                  /* 필요 시 일정 상세 연결 */
                }}
              />
            </aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 우하단 새 Task 버튼 */}
      <Button
        size="lg"
        onClick={() => setOpenNew(true)}
        className="fixed bottom-6 right-6 h-14 w-36 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-transform cursor-pointer"
      >
        <CalendarDays className="w-5 h-5 mr-2" />새 Task
      </Button>

      {/* 새 Task 다이얼로그 */}
      <NewTaskDialog
        open={openNew}
        onOpenChange={setOpenNew}
        defaultDate={selectedDate}
        onCreate={async (payload) => {
          await apiCreate(payload);
          await Promise.all([
            reloadDaily(),
            reloadDay(toYMD(selectedDate)),
            reloadDue(),
          ]);
          setUpcomingSchedules(await fetchUpcomingSchedules(30));
          const start = toYMD(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          );
          const end = toYMD(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
          );
          await loadMonthMap(start, end);
          setSelectedSchedules(
            await fetchSchedulesInRange(
              toYMD(selectedDate),
              toYMD(selectedDate)
            )
          );
        }}
      />

      {/* 날짜 선택 다이얼로그 */}
      <Dialog open={openDatePick} onOpenChange={setOpenDatePick}>
        <DialogContent className="sm:max-w-[520px] bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              날짜 선택
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => handleDateInput(e.target.value)}
                className="w-[180px]"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date();
                  setDatePickValue(now);
                  setDateInput(toYMD(now));
                }}
                className="cursor-pointer"
              >
                오늘
              </Button>
            </div>
            <div className="border rounded-xl p-2">
              <Calendar
                mode="single"
                selected={datePickValue}
                onSelect={(d) => {
                  if (!d) return;
                  setDatePickValue(d);
                  setDateInput(toYMD(d));
                }}
                initialFocus
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpenDatePick(false)}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button onClick={applyPickedDate} className="cursor-pointer">
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────── UI helpers (CAL 우측 요약용) ───────────── */

function Legend({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "rose" | "amber" | "indigo";
}) {
  const toneMap = {
    emerald: "bg-emerald-100 border-emerald-200 text-emerald-700",
    rose: "bg-rose-100 border-rose-200 text-rose-700",
    amber: "bg-amber-100 border-amber-200 text-amber-700",
    indigo: "bg-indigo-100 border-indigo-200 text-indigo-700",
  } as const;
  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border ${toneMap[tone]}`}
    >
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

function SectionTitle({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-neutral-700">{label}</div>
      <div className="text-[11px] text-neutral-500">{desc}</div>
    </div>
  );
}

function TitleOnlyList({
  items,
  tone,
  emptyText,
}: {
  items: string[];
  tone: "emerald" | "rose" | "amber" | "indigo";
  emptyText?: string;
}) {
  const toneBg = {
    emerald: "bg-emerald-50 border-emerald-200",
    rose: "bg-rose-50 border-rose-200",
    amber: "bg-amber-50 border-amber-200",
    indigo: "bg-indigo-50 border-indigo-200",
  } as const;
  if (!items.length)
    return (
      <div className="text-sm text-muted-foreground">
        {emptyText || "항목이 없습니다."}
      </div>
    );
  return (
    <div className="space-y-2">
      {items.map((title, i) => (
        <div
          key={`${title}-${i}`}
          className={`rounded-lg border px-3 py-2 ${toneBg[tone]} text-sm truncate`}
          title={title}
        >
          {title}
        </div>
      ))}
    </div>
  );
}
