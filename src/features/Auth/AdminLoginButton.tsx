// src/components/admin/AdminLoginButton.tsx
import { useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "./useAdmin"; // 너가 쓰는 경로 유지
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

export default function AdminLoginButton() {
  const { isAdmin, setAdmin, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "로그인 실패";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    try {
      setLoading(true);
      await logout(); // signOut + isAdmin=false
      setOpen(false);
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
        {/* 트리거: 하나만 사용, 라벨은 상태에 따라 변경 */}
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="hover:cursor-pointer  font-semibold text-xm"
            title={isAdmin ? "현재: 관리자 모드" : "현재: 게스트 모드"}
          >
            {isAdmin ? "관리자 모드" : "게스트 모드"}
          </Button>
        </DialogTrigger>

        {/* 다이얼로그: 하나만 두고, 내용/버튼 동작·라벨만 분기 */}
        <DialogContent className="sm:max-w-md ">
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? "로그아웃 하시겠습니까?" : "관리자 로그인"}
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
              className="hover:bg-green-200 hover:cursor-pointer"
            >
              {primaryLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
