// src/components/admin/AdminLoginButton.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/components/admin/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AdminLoginButton() {
  const { setAdmin } = useAdmin();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(""); // 관리자 이메일
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
      // 로그인 성공 == 관리자
      setAdmin(true);
      setOpen(false);
    } catch (e: any) {
      alert(e.message ?? "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">관리자 로그인</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>관리자 로그인</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw">비밀번호</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onLogin} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
