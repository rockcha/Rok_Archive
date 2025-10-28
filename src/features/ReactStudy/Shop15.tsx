"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { motion } from "framer-motion";
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

const mockProducts = [
  {
    id: 1,
    name: "벨티드 트렌치 코트",
    price: 99000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "하이웨이스트 와이드 진",
    price: 29900,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "니트 가디건",
    price: 39900,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "플로럴 원피스",
    price: 49900,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    name: "오버사이즈 셔츠",
    price: 25900,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    name: "캐시미어 머플러",
    price: 19900,
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31958?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    name: "체크 자켓",
    price: 89900,
    image:
      "https://images.unsplash.com/photo-1542060748-10c28b62716b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    name: "플리츠 스커트",
    price: 34900,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Shop15() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      {/* Header */}
      <header className="flex flex-col gap-3 px-8 py-5 border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-rose-500 tracking-tight">
            H&M
          </h1>

          <div className="flex items-center gap-4">
            {!loggedIn ? (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-rose-500"
                  >
                    <LogIn className="mr-2 h-4 w-4" /> 로그인
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                      로그인
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground text-center">
                      임시: 아무 정보를 넣어도 로그인됩니다.
                    </p>
                    <Input placeholder="이메일" />
                    <Input placeholder="비밀번호" type="password" />
                    <Button
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                      onClick={() => {
                        setLoggedIn(true);
                        setOpen(false);
                      }}
                    >
                      로그인하기
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-rose-500"
                onClick={() => setLoggedIn(false)}
              >
                <LogOut className="mr-2 h-4 w-4" /> 로그아웃
              </Button>
            )}
          </div>
        </div>

        {/* Category Nav */}
        <nav className="relative">
          <ul className="flex flex-wrap gap-4 text-sm text-gray-700">
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Heart className="w-4 h-4" />
              여성
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Shirt className="w-4 h-4" />
              Divided
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Shirt className="w-4 h-4" />
              남성
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Baby className="w-4 h-4" />
              신생아/유아
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Baby className="w-4 h-4" />
              아동
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Home className="w-4 h-4" />
              H&M HOME
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <BadgePercent className="w-4 h-4" />
              Sale
            </li>
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
              <Leaf className="w-4 h-4" />
              지속가능성
            </li>
          </ul>
        </nav>

        {/* Search Section */}
        <section className="pt-2 pb-4">
          <div className="max-w-3xl mx-auto w-full">
            <div className="relative">
              <Input
                placeholder="예: 봄 원피스, 린넨 셔츠, 와이드 진, 로퍼…"
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

      {/* Product Grid */}
      <main className="flex-1 p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {mockProducts.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
              <CardHeader className="p-3 pb-0 text-sm text-gray-700 font-medium">
                {p.name}
              </CardHeader>
              <CardContent className="p-3 pt-1 text-gray-500 text-sm">
                ₩{p.price.toLocaleString()}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © 2025 H&M Style Mock Page
      </footer>
    </div>
  );
}
