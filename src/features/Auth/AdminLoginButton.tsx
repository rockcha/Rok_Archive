// src/components/admin/AdminLoginButton.tsx
"use client";

import { useState } from "react";
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
import { Switch } from "@/shared/ui/switch";
import { toast } from "sonner";

type Intent = "toAdmin" | "toGuest" | null;

export default function AdminLoginButton() {
  const { isAdmin, setAdmin, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const openLogin = () => {
    setIntent("toAdmin");
    setOpen(true);
  };

  const openLogoutConfirm = () => {
    setIntent("toGuest");
    setOpen(true);
  };

  // Switch 토글 → 실제 상태는 성공 시에만 변경
  const handleToggle = (nextChecked: boolean) => {
    if (nextChecked && !isAdmin) openLogin();
    else if (!nextChecked && isAdmin) openLogoutConfirm();
  };

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
      setIntent(null);
      setEmail("");
      setPassword("");
      toast.success("관리자로 로그인되었습니다.", { description: email });
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
      await logout();
      setOpen(false);
      setIntent(null);
      toast.success("게스트 모드로 전환되었습니다.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "로그아웃 실패";
      toast.error("로그아웃 중 오류가 발생했습니다.", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const primaryDisabled =
    loading || (intent === "toAdmin" && (!email || !password));
  const primaryLabel = loading
    ? intent === "toAdmin"
      ? "확인 중..."
      : "처리 중..."
    : intent === "toAdmin"
    ? "로그인"
    : "로그아웃";

  // 활성/비활성 라벨 스타일
  const activeCls = "text-black font-bold";
  const inactiveCls = "text-neutral-400 font-medium";

  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <Dialog open={open} onOpenChange={setOpen}>
        {/* 왼쪽 라벨: 게스트 */}

        <button
          type="button"
          className={`text-xs ${
            isAdmin ? inactiveCls : activeCls
          } hover:opacity-80`}
          onClick={() => {
            if (isAdmin) openLogoutConfirm(); // 관리자 → 게스트 의도
          }}
          aria-label="게스트로 전환"
        >
          게스트
        </button>

        {/* 스위치 */}
        <Switch
          checked={isAdmin}
          onCheckedChange={handleToggle}
          aria-label="계정 전환 스위치"
          className="
    bg-neutral-500 
    data-[state=checked]:bg-neutral-500 
    data-[state=unchecked]:bg-neutral-500
    dark:data-[state=checked]:bg-neutral-500
    dark:data-[state=unchecked]:bg-neutral-500
    hover:cursor-pointer
  "
        />

        <DialogTrigger asChild>
          <button className="sr-only">open dialog</button>
        </DialogTrigger>

        {/* 오른쪽 라벨: 관리자 */}
        <button
          type="button"
          className={`text-xs ${
            isAdmin ? activeCls : inactiveCls
          } hover:opacity-80`}
          onClick={() => {
            if (!isAdmin) openLogin(); // 게스트 → 관리자 의도
          }}
          aria-label="관리자로 전환"
        >
          관리자
        </button>

        {/* 다이얼로그 */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {intent === "toAdmin"
                ? "관리자 계정으로 전환"
                : "게스트 계정으로 전환하시겠습니까?"}
            </DialogTitle>
          </DialogHeader>

          {intent === "toAdmin" ? (
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
          ) : (
            <p className="text-sm text-muted-foreground">
              현재 계정이 관리자입니다. 게스트 모드로 전환하면 일부 기능이
              제한될 수 있어요.
            </p>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={intent === "toAdmin" ? onLogin : onLogout}
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
