// src/components/admin/AdminLoginButton.tsx
"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "./useAdmin";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

export default function AdminLoginButton() {
  const { isAdmin, setAdmin, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 상태별 아이콘 PNG 경로 (shared/assets/Admin.png | Guest.png)
  const iconSrc = useMemo(() => {
    const name = isAdmin ? "Admin" : "Guest";
    try {
      return new URL(`../../shared/assets/${name}.png`, import.meta.url).href;
    } catch {
      return undefined;
    }
  }, [isAdmin]);

  const onLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      setAdmin(true);
      setOpen(false);
      setEmail("");
      setPassword("");
      // ✅ Sonner toast (브라우저 alert 대신)
      toast.success("관리자로 로그인되었습니다.", {
        description: email,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "로그인 실패";
      toast.error("로그인에 실패했습니다.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    try {
      setLoading(true);
      await logout(); // signOut + isAdmin=false
      setOpen(false);
      // ✅ Sonner toast
      toast.success("게스트 모드로 전환되었습니다.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "로그아웃 실패";
      toast.error("로그아웃 중 오류가 발생했습니다.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const primaryAction = isAdmin ? onLogout : onLogin;
  const primaryDisabled = loading || (!isAdmin && (!email || !password));
  const primaryLabel = loading
    ? isAdmin
      ? "처리 중..."
      : "확인 중..."
    : isAdmin
    ? "로그아웃"
    : "로그인";

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* ▶ 트리거 버튼: 아이콘 + 라벨(게스트/관리자) */}
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            title={isAdmin ? "현재: 관리자 계정" : "현재: 게스트 계정"}
            className="
              w-20 h-20 p-2 
              flex flex-col items-center justify-center gap-1
              hover:cursor-pointer
              scale-[0.8]  /* ✅ 0.8배 크기 */
            "
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt={isAdmin ? "관리자 계정" : "게스트 계정"}
                className="w-8 h-8 object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8" />
            )}
            <span className="text-xs font-bold tracking-tight">
              {isAdmin ? "관리자 계정" : "게스트 계정"}
            </span>
          </Button>
        </DialogTrigger>

        {/* ▶ 다이얼로그 */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAdmin
                ? "게스트 계정으로 전환하시겠습니까?"
                : "관리자 계정으로 전환"}
            </DialogTitle>
          </DialogHeader>

          {!isAdmin && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pw">비밀번호</Label>
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && onLogin()}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={primaryAction}
              disabled={primaryDisabled}
              className="hover:cursor-pointer"
            >
              {primaryLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
