"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { CalendarDays } from "lucide-react";
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
} from "./api";

import NewTaskDialog from "./NewTaskDialog";
import DayGrid from "./DayGrid";
import DueList from "./DueList";
import TaskDetail from "./TaskDetail";
import CalendarPanel from "./CalendarPanel";
import ScheduleList from "./ScheduleList";
import { Calendar } from "@/shared/ui/calendar";
import { Input } from "@/shared/ui/input";

type Tab = "LIST" | "CAL";
type RightTab = "TASK" | "SCHEDULE";

export default function TaskPage() {
  const [tab, setTab] = useState<Tab>("LIST");
  const [rightTab, setRightTab] = useState<RightTab>("TASK");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 데이터
  const [daily, setDaily] = useState<Task[]>([]);
  const [dayTasks, setDayTasks] = useState<Task[]>([]);
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // 진행률 (DAY + DAILY)
  const [allCount, setAllCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  // 새 Task
  const [openNew, setOpenNew] = useState(false);

  // DUE 상세
  const [openDueDetail, setOpenDueDetail] = useState(false);
  const [dueDetail, setDueDetail] = useState<Task | null>(null);

  // 캘린더 모드 오른쪽: 선택 날짜 스케쥴
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);
  // 목록 모드 오른쪽: 다가오는 스케쥴
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);

  // 월 범위 맵 (캘린더 카운트 일관성)
  const [monthMap, setMonthMap] = useState<
    Record<
      string,
      { day: Task[]; due: Task[]; daily: Task[]; schedule?: number }
    >
  >({});

  // 날짜 선택 다이얼로그 (목록 모드)
  const [openDatePick, setOpenDatePick] = useState(false);
  const [datePickValue, setDatePickValue] = useState<Date>(new Date());
  const [dateInput, setDateInput] = useState<string>(toYMD(new Date()));

  const autosaveTimer = useRef<Record<number, any>>({});

  const selectedTask = useMemo(
    () => [...daily, ...dayTasks].find((t) => t.id === selectedTaskId) || null,
    [daily, dayTasks, selectedTaskId]
  );

  // ✅ DAILY 포함 진행률
  useEffect(() => {
    const dayAll = dayTasks.length;
    const dayDone = dayTasks.filter((t) => t.is_completed).length;
    const dailyAll = daily.length;
    const dailyDone = daily.filter((t) => t.is_completed).length;
    setAllCount(dayAll + dailyAll);
    setDoneCount(dayDone + dailyDone);
  }, [dayTasks, daily]);

  const progressPct = useMemo(() => {
    if (allCount === 0) return 0;
    return Math.round((doneCount / allCount) * 100);
  }, [allCount, doneCount]);

  const selectedDateStr = format(selectedDate, "yyyy.MM.dd");
  const selectedYMD = toYMD(selectedDate);

  /* Fetchers */
  const reloadDaily = async () => setDaily(await fetchDailyTasks());

  const reloadDay = async (ymd: string) => {
    const list = await fetchDayTasksByDate(ymd);
    setDayTasks(list);
    // 날짜 바뀔 때 이전 선택이 남는 이슈 방지
    if (!list.find((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  };

  const reloadDue = async () => {
    setDueTasks(await fetchDueTasksFrom(toYMD(new Date())));
  };

  useEffect(() => {
    const ymd = selectedYMD;
    Promise.all([reloadDaily(), reloadDay(ymd), reloadDue()]);
    (async () => {
      const ups = await fetchUpcomingSchedules(30);
      setUpcomingSchedules(ups);
      // 초기 월맵도 로드(현재 달)
      const start = toYMD(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
      const end = toYMD(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      );
      await loadMonthMap(start, end);
      // 초기 우측 패널 스케쥴
      const ss = await fetchSchedulesInRange(ymd, ymd);
      setSelectedSchedules(ss);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ymd = selectedYMD;
    (async () => {
      await reloadDay(ymd);
      const ss = await fetchSchedulesInRange(ymd, ymd);
      setSelectedSchedules(ss);
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
    // 범위 내 모든 날짜에 daily 채우기
    const s = new Date(startYMD + "T00:00:00");
    const e = new Date(endYMD + "T00:00:00");
    for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
      const k = toYMD(cur);
      if (!m[k]) m[k] = { day: [], due: [], daily: dailyList };
    }
    setMonthMap(m);
  };

  /* Actions */
  const scheduleAutosave = (task: Task, patch: Partial<Task>) => {
    const updateLocal = (arr: Task[]) =>
      arr.map((t) => (t.id === task.id ? { ...t, ...patch } : t));
    setDayTasks((prev) => updateLocal(prev));
    setDaily((prev) => updateLocal(prev));

    if (autosaveTimer.current[task.id])
      clearTimeout(autosaveTimer.current[task.id]);
    autosaveTimer.current[task.id] = setTimeout(async () => {
      await updateTask(task.id, patch);
    }, 500);
  };

  const deleteTask = async (task: Task) => {
    await deleteTaskRow(task.id);
    setSelectedTaskId(null);
    await Promise.all([reloadDay(selectedYMD), reloadDue(), reloadDaily()]);
  };

  // 날짜 선택 다이얼로그 열기
  const openDateDialog = () => {
    setDatePickValue(selectedDate);
    setDateInput(toYMD(selectedDate));
    setOpenDatePick(true);
  };

  // 날짜 입력 핸들러(YYYY-MM-DD)
  const handleDateInput = (v: string) => {
    setDateInput(v);
    const [y, m, d] = v.split("-").map(Number);
    if (y && m && d) setDatePickValue(new Date(y, m - 1, d));
  };

  const applyPickedDate = () => {
    setSelectedDate(new Date(datePickValue));
    setOpenDatePick(false);
  };

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
                selectedYMD={selectedYMD}
                onPickDate={(ymd) =>
                  setSelectedDate(new Date(ymd + "T00:00:00"))
                }
                onRangeChange={loadMonthMap}
              />
            </section>

            {/* 우: 디테일 패널 */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {selectedDateStr} ({weekdayKR(selectedDate)})
                  </CardTitle>
                  {/* 색상 팁 */}
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

                  <SectionTitle label="DAY" desc="오늘 해야하는 일" />
                  <TitleOnlyList
                    items={dayTasks.map((t) => t.title || "(제목 없음)")}
                    tone="rose"
                    emptyText="오늘의 DAY가 없습니다."
                  />

                  <SectionTitle label="DUE" desc="특정 날까지 해야하는 일" />
                  <TitleOnlyList
                    items={dueTasks
                      .filter((t) => t.date === selectedYMD)
                      .map((t) => t.title || "(제목 없음)")}
                    tone="amber"
                    emptyText="해당 날짜의 DUE가 없습니다."
                  />

                  <SectionTitle label="SCHEDULE" desc="일정" />
                  <TitleOnlyList
                    items={selectedSchedules.map(
                      (s) => s.title || "(제목 없음)"
                    )}
                    tone="indigo"
                    emptyText="해당 날짜의 스케쥴이 없습니다."
                  />
                </CardContent>
              </Card>
            </aside>
          </motion.div>
        ) : (
          <motion.div
            key="LIST"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-6"
          >
            {/* LEFT */}
            <section className="col-span-12 lg:col-span-8">
              {/* 오늘의 요약 (Progress Bar + 날짜 버튼 2개: 오늘, 날짜 변경) */}
              <Card className="mb-4 rounded-2xl">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    📌 {selectedDateStr} ({weekdayKR(selectedDate)})
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
                  {/* 🎨 업그레이드 Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="relative h-3.5 rounded-full border bg-gradient-to-b from-white to-muted/60 shadow-inner overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary/90 via-primary to-primary/90 shadow-sm transition-all"
                        style={{ width: `${progressPct}%` }}
                        aria-label={`완료율 ${progressPct}%`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {doneCount} / {allCount} 완료
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 오늘의 Task (타입별 색상/호버, 클릭 선택) */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">📌 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <DayGrid
                    dailyItems={daily} // DAILY 맨 앞, 고정
                    items={dayTasks}
                    selectedId={selectedTaskId}
                    onSelect={setSelectedTaskId}
                  />
                </CardContent>
              </Card>

              {/* 상세 (완료 토글/삭제만) */}
              <Card className="mt-6 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl">📌 상세보기</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
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

            {/* RIGHT: 탭(다가오는 Task / 스케쥴) */}
            <aside className="col-span-12 lg:col-span-4">
              <Card className="rounded-2xl h-[720px] flex flex-col">
                <CardHeader className="pb-2">
                  <div className="relative bg-white border rounded-full p-1 flex items-center gap-1">
                    <div className="relative w-[260px] grid grid-cols-2">
                      <motion.div
                        layout
                        className="absolute top-0 bottom-0 w-1/2 rounded-full bg-primary/10"
                        animate={{ x: rightTab === "TASK" ? 0 : "100%" }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                      <button
                        className={`z-10 py-1.5 text-sm rounded-full cursor-pointer ${
                          rightTab === "TASK"
                            ? "text-primary font-medium"
                            : "text-neutral-600"
                        }`}
                        onClick={() => setRightTab("TASK")}
                      >
                        다가오는 Task
                      </button>
                      <button
                        className={`z-10 py-1.5 text-sm rounded-full cursor-pointer ${
                          rightTab === "SCHEDULE"
                            ? "text-primary font-medium"
                            : "text-neutral-600"
                        }`}
                        onClick={() => setRightTab("SCHEDULE")}
                      >
                        다가오는 스케쥴
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-[640px] pr-2 bg-muted/10 rounded-xl">
                    {rightTab === "TASK" ? (
                      <DueList
                        items={dueTasks}
                        onClick={(t) => {
                          setDueDetail(t);
                          setOpenDueDetail(true);
                        }}
                      />
                    ) : (
                      <ScheduleList items={upcomingSchedules} />
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 우하단 고정 새 Task 버튼 */}
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
            reloadDay(selectedYMD),
            reloadDue(),
          ]);
          const ups = await fetchUpcomingSchedules(30);
          setUpcomingSchedules(ups);
          // 월맵 갱신(새로 추가된 항목 반영)
          const start = toYMD(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
          );
          const end = toYMD(
            new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
          );
          await loadMonthMap(start, end);
          // 같은 날이면 우측 스케쥴도 갱신
          const ss = await fetchSchedulesInRange(selectedYMD, selectedYMD);
          setSelectedSchedules(ss);
        }}
      />

      {/* DUE 상세 다이얼로그 */}
      <Dialog open={openDueDetail} onOpenChange={setOpenDueDetail}>
        <DialogContent className="sm:max-w-[620px] bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              DUE Task 상세
            </DialogTitle>
          </DialogHeader>
          {dueDetail && (
            <TaskDetail
              task={dueDetail}
              onPatch={async (p) => {
                await updateTask(dueDetail.id, p);
                await Promise.all([reloadDue(), reloadDay(selectedYMD)]);
                setDueDetail({ ...dueDetail, ...p } as Task);
              }}
              onDelete={async () => {
                const ok = window.confirm("정말 삭제하시겠습니까?");
                if (!ok) return;
                await deleteTaskRow(dueDetail.id);
                setOpenDueDetail(false);
                setDueDetail(null);
                await Promise.all([reloadDue(), reloadDay(selectedYMD)]);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 날짜 선택 다이얼로그 (목록 모드 전용) */}
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
                  setDatePickValue(new Date());
                  setDateInput(toYMD(new Date()));
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

/* ───────────── UI helpers ───────────── */

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

/** 제목만 세로 나열, 톤 컬러 박스 */
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
