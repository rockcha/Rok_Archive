// src/components/admin/AdminDock.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "@/shared/magicui/dock";
import { cn } from "@/shared/lib/utils";
import {
  PencilLine,
  Github,
  Bot,
  CalendarDays,
  CheckSquare,
  Notebook,
  ListTodo,
} from "lucide-react";
import { SiSupabase } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { buttonVariants } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

import { useAdmin } from "@/features/Auth/useAdmin";
import { toast } from "sonner";

export default function AdminDock() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  // 핸들러
  const handleNewPost = () => navigate("/posts/new");

  // ✅ 관리자 전용
  const handleTodosPage = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 접근할 수 있습니다." });
      return;
    }
    navigate("/todos");
  };

  // ✅ 관리자 전용
  const handleCalendar = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 접근할 수 있습니다." });
      return;
    }
    navigate("/schedular");
  };

  const handleGitHub = () =>
    window.open(
      "https://github.com/rockcha/Rok_Archive",
      "_blank",
      "noopener,noreferrer"
    );
  const handleChatGPT = () =>
    window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
  const handleSupabase = () =>
    window.open(
      "https://supabase.com/dashboard/project/dckvzxvcsyfhfowaecoh",
      "_blank",
      "noopener,noreferrer"
    );

  // ▶ 메모/투두 모달 열기 (커스텀 이벤트 디스패치)
  const handleMemoModal = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 사용할 수 있습니다." });
      return;
    }
    window.dispatchEvent(new Event("open-floating-memo"));
  };

  const handleTodoModal = () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 사용할 수 있습니다." });
      return;
    }
    window.dispatchEvent(new Event("open-floating-todo"));
  };

  const iconBtn = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-12 rounded-full hover:cursor-pointer"
  );

  return (
    <TooltipProvider>
      <Dock
        direction="middle"
        iconSize={44}
        iconMagnification={64}
        iconDistance={140}
        className="border-none"
      >
        {/* 글작성 */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="글 작성"
                className={iconBtn}
                onClick={handleNewPost}
              >
                <PencilLine className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>글 작성</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* 오늘의 할일 (관리자 전용) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="오늘의 할일"
                className={iconBtn}
                onClick={handleTodosPage}
              >
                <CheckSquare className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>오늘의 할일</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* 캘린더 (관리자 전용) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="캘린더"
                className={iconBtn}
                onClick={handleCalendar}
              >
                <CalendarDays className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>캘린더</TooltipContent>
          </Tooltip>
        </DockIcon>

        <Separator orientation="vertical" className="h-full bg-neutral-500" />

        {/* GitHub */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="GitHub"
                className={iconBtn}
                onClick={handleGitHub}
              >
                <Github className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>GitHub</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* Supabase */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Supabase"
                className={iconBtn}
                onClick={handleSupabase}
              >
                <SiSupabase className="size-4" color="#3ECF8E" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Supabase</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* ChatGPT */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="ChatGPT"
                className={iconBtn}
                onClick={handleChatGPT}
              >
                <Bot className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>ChatGPT</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* ← 여기 추가 구간 */}
        <Separator orientation="vertical" className="h-full bg-neutral-500" />

        {/* 메모 (모달 열기) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="메모"
                className={iconBtn}
                onClick={handleMemoModal}
              >
                <Notebook className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>메모</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* 투두 (모달 열기) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="할 일"
                className={iconBtn}
                onClick={handleTodoModal}
              >
                <ListTodo className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>할 일</TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}
