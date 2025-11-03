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
  BookOpenCheck,
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

  // --- 공통: 관리자 가드
  const requireAdmin = (fn: () => void) => () => {
    if (!isAdmin) {
      toast.error("권한 없음", { description: "관리자만 접근할 수 있습니다." });
      return;
    }
    fn();
  };

  // 핸들러
  const handleNewPost = () => navigate("/posts/new");

  // ✅ 관리자 전용
  const handleCalendar = requireAdmin(() => navigate("/schedular"));

  // 리액트 스터디 (공개)
  const handleReactStudy = () => navigate("/study");

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

  // ▶ 메모 모달 열기 (관리자 전용)
  const handleMemoModal = requireAdmin(() => {
    window.dispatchEvent(new Event("open-floating-memo"));
  });

  // ▶ 할 일: /tasks (이제 관리자 전용으로 변경)
  const handleTasksPage = requireAdmin(() => navigate("/tasks"));

  const iconBtn = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-12 rounded-full hover:cursor-pointer"
  );

  // 비관리자에게는 아이콘을 살짝 흐리게 표시(클릭 시 토스트 노출은 유지)
  const adminOnlyClass = !isAdmin ? "opacity-50" : "";

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

        {/* 캘린더 (관리자 전용) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="캘린더"
                className={cn(iconBtn, adminOnlyClass)}
                onClick={handleCalendar}
                aria-disabled={!isAdmin}
              >
                <CalendarDays className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>캘린더 (관리자)</TooltipContent>
          </Tooltip>
        </DockIcon>

        {/* 할 일 (/tasks, 관리자 전용으로 변경) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="할 일"
                className={cn(iconBtn, adminOnlyClass)}
                onClick={handleTasksPage}
                aria-disabled={!isAdmin}
              >
                <ListTodo className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>할 일 (관리자)</TooltipContent>
          </Tooltip>
        </DockIcon>
        {/* 리액트 스터디 (공개) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="리액트 스터디"
                className={iconBtn}
                onClick={handleReactStudy}
              >
                <BookOpenCheck className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>리액트 스터디</TooltipContent>
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

        <Separator orientation="vertical" className="h-full bg-neutral-500" />

        {/* 메모 (관리자 전용) */}
        <DockIcon className="group">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="메모"
                className={cn(iconBtn, adminOnlyClass)}
                onClick={handleMemoModal}
                aria-disabled={!isAdmin}
              >
                <Notebook className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>메모 (관리자)</TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </TooltipProvider>
  );
}
