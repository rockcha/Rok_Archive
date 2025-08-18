// src/components/admin/AdminDock.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dock, DockIcon } from "@/shared/magicui/dock";
import { cn } from "@/shared/lib/utils";
import { PencilLine, Tag, Github, Bot, CalendarDays } from "lucide-react"; // ⬅️ CalendarDays 추가
import { SiSupabase } from "react-icons/si";
import { useAdmin } from "@/features/Auth/useAdmin";
import { supabase } from "@/shared/lib/supabase";

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
import { buttonVariants, Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type Props = { className?: string };

export default function AdminDock({ className }: Props) {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [alertOpen, setAlertOpen] = useState(false);

  // ▒▒ 카테고리 추가 모달 상태 ▒▒
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const catInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (catOpen) setTimeout(() => catInputRef.current?.focus(), 0);
  }, [catOpen]);

  const withAuth = (fn: () => void) => {
    if (!isAdmin) return setAlertOpen(true);
    fn();
  };

  // 핸들러
  const handleNewPost = () => navigate("/posts/new");
  const handleAddCategory = () => setCatOpen(true); // ✅ 모달 오픈
  const handleCalendar = () => navigate("/schedular"); // ⬅️ 캘린더 라우트
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

  const onConfirmAddCategory = async () => {
    const n = catName.trim();
    if (!n) return alert("카테고리 이름을 입력하세요.");
    if (n.length > 60) return alert("카테고리 이름이 너무 깁니다(최대 60자).");

    setCatSaving(true);
    try {
      const { error } = await supabase.from("categories").insert({ name: n });
      if (error) throw error;
      alert("카테고리가 추가되었습니다.");
      setCatName("");
      setCatOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "추가에 실패했습니다.";
      alert(msg);
    } finally {
      setCatSaving(false);
    }
  };

  const iconBtn = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "size-12 rounded-full",
    "hover:cursor-pointer"
  );

  return (
    <>
      <div className={cn("inline-block text-center", className)}>
        <TooltipProvider>
          <Dock
            direction="middle"
            iconSize={44}
            iconMagnification={64}
            iconDistance={130}
            className="shadow-lg"
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

            {/* 카테고리 추가 */}
            <DockIcon className="group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="카테고리 추가"
                    className={iconBtn}
                    onClick={() => withAuth(handleAddCategory)}
                  >
                    <Tag className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>카테고리 추가</TooltipContent>
              </Tooltip>
            </DockIcon>

            {/* ⬅️ 새로 추가: 캘린더 (다음) */}
            <DockIcon className="group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="캘린더 (다음)"
                    className={iconBtn}
                    onClick={() => withAuth(handleCalendar)}
                  >
                    <CalendarDays className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>캘린더 (다음)</TooltipContent>
              </Tooltip>
            </DockIcon>

            <Separator orientation="vertical" className="h-full" />

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
      </div>

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
            <AlertDialogCancel>닫기</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 카테고리 추가 다이얼로그 */}
      <AlertDialog
        open={catOpen}
        onOpenChange={(v) => {
          if (!catSaving) setCatOpen(v);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 추가</AlertDialogTitle>
            <AlertDialogDescription>
              추가할 카테고리 이름을 입력하세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!catSaving) onConfirmAddCategory();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="dock-category-name" className="text-sm">
                이름
              </Label>
              <Input
                id="dock-category-name"
                ref={catInputRef}
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="예) React, Typescript"
                disabled={catSaving}
                className="h-11 text-base"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={catSaving}>취소</AlertDialogCancel>
              <Button type="submit" disabled={catSaving}>
                {catSaving ? "추가 중..." : "추가"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
