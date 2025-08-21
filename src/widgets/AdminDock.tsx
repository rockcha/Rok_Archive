// src/components/admin/AdminDock.tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "@/shared/magicui/dock";
import { cn } from "@/shared/lib/utils";
import {
  PencilLine,
  Github,
  Bot,
  CalendarDays,
  CheckSquare,
} from "lucide-react";
import { SiSupabase } from "react-icons/si";
import { useAdmin } from "@/features/Auth/useAdmin";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { buttonVariants } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

export default function AdminDock() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [alertOpen, setAlertOpen] = useState(false);

  const withAuth = (fn: () => void) => {
    if (!isAdmin) return setAlertOpen(true);
    fn();
  };

  // 핸들러
  const handleNewPost = () => navigate("/posts/new");
  const handleCalendar = () => navigate("/schedular");
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

  const iconBtn = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-12 rounded-full hover:cursor-pointer"
  );

  return (
    <>
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
                  onClick={() => withAuth(handleNewPost)}
                >
                  <PencilLine className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>글 작성</TooltipContent>
            </Tooltip>
          </DockIcon>

          {/* 오늘의 할일 */}
          <DockIcon className="group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="오늘의 할일"
                  className={iconBtn}
                  onClick={() => navigate("/todos")}
                >
                  <CheckSquare className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>오늘의 할일</TooltipContent>
            </Tooltip>
          </DockIcon>

          {/* 캘린더 */}
          <DockIcon className="group">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="캘린더"
                  className={iconBtn}
                  onClick={() => withAuth(handleCalendar)}
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
                  onClick={() => withAuth(handleGitHub)}
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
                  onClick={() => withAuth(handleSupabase)}
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
                  onClick={() => withAuth(handleChatGPT)}
                >
                  <Bot className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>ChatGPT</TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>

      {/* 권한 없음 다이얼로그 */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>권한이 없습니다</AlertDialogTitle>
            <AlertDialogDescription>
              관리자만 접근할 수 있는 기능입니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">
              닫기
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
