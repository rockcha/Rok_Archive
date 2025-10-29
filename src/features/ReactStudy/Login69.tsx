"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  Search,
  Heart,
  Baby,
  Shirt,
  Home,
  BadgePercent,
  Leaf,
} from "lucide-react";

/** 랜딩과 동일한 헤더 */
function Header69({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-3 px-8 py-5 border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <h1
          className="text-3xl font-semibold text-rose-500 tracking-tight cursor-pointer"
          onClick={() => navigate("/tasks/shop-6-9")}
        >
          H&M
        </h1>

        <div className="flex items-center gap-4">
          {!loggedIn ? (
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-rose-500"
              onClick={() => navigate("/login")}
            >
              <LogIn className="mr-2 h-4 w-4" /> 로그인
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-rose-500"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> 로그아웃
            </Button>
          )}
        </div>
      </div>

      {/* 간단 카테고리 (시각적 일관성) */}
      <nav className="relative">
        <ul className="flex flex-wrap gap-4 text-sm text-gray-700">
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <Heart className="w-4 h-4" />
            여성
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <Shirt className="w-4 h-4" />
            남성
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <Baby className="w-4 h-4" />
            아동
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <Home className="w-4 h-4" />
            HOME
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <BadgePercent className="w-4 h-4" />
            Sale
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50 cursor-pointer transition">
            <Leaf className="w-4 h-4 text-emerald-500" />
            지속가능성
          </li>
        </ul>
      </nav>

      {/* Search UI (일관성) */}
      <section className="pt-2 pb-4">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative">
            <Input
              placeholder="검색어를 입력하세요"
              className="h-12 rounded-2xl pl-12 pr-4 shadow-sm ring-1 ring-rose-100 focus-visible:ring-rose-300"
              aria-label="상품 검색"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-5 bg-rose-500 hover:bg-rose-600">
              검색
            </Button>
          </div>
        </div>
      </section>
    </header>
  );
}

export default function Login69() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    const v = localStorage.getItem("hm69_logged_in") === "1";
    setLoggedIn(v);
  }, []);

  const onLogout = useCallback(() => {
    localStorage.removeItem("hm69_logged_in");
    setLoggedIn(false);
  }, []);

  const onLogin = useCallback(() => {
    // 서버 없이 데모 로그인 처리
    localStorage.setItem("hm69_logged_in", "1");
    setLoggedIn(true);
    navigate("/tasks/shop-6-9"); //
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Header69 loggedIn={loggedIn} onLogout={onLogout} />

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <h2 className="text-center text-2xl font-semibold">로그인</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              임시: 아무 정보를 넣어도 로그인됩니다.
            </p>
            <div className="space-y-3">
              <Input
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="비밀번호"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                onClick={onLogin}
              >
                로그인하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © 2025 H&M Style Mock Page
      </footer>
    </div>
  );
}
