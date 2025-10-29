"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { motion } from "framer-motion";
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

/** ✅ 과제 2번: conscious choice 표시 on/off */
const CONSCIOUS_CHOICE = true; // false면 '지속가능성' 메뉴 숨김

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "벨티드 트렌치 코트",
    price: 99000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    name: "하이웨이스트 와이드 진",
    price: 29900,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    name: "니트 가디건",
    price: 39900,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    name: "플로럴 원피스",
    price: 49900,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    name: "오버사이즈 셔츠",
    price: 25900,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    name: "캐시미어 머플러",
    price: 19900,
    image: "https://picsum.photos/seed/cashmere-scarf-69/1200/1200",
  },
  {
    id: 7,
    name: "가죽 자켓",
    price: 89900,
    image: "https://picsum.photos/seed/leather-jacket-69/1200/1200",
  },
  {
    id: 8,
    name: "플리츠 스커트",
    price: 34900,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
];

/** 헤더: 두 페이지에서 공용 사용 */
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
          onClick={() => navigate("/")}
        >
          H&amp;M
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
            H&amp;M HOME
          </li>
          <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-50 cursor-pointer transition">
            <BadgePercent className="w-4 h-4" />
            Sale
          </li>

          {/* ✅ conscious choice 토글 */}
          {CONSCIOUS_CHOICE && (
            <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50 cursor-pointer transition">
              <Leaf className="w-4 h-4 text-emerald-500" />
              지속가능성
            </li>
          )}
        </ul>
      </nav>

      {/* Search */}
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
  );
}

export default function Shop69() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  /** 로그인 유지(로컬 스토리지 사용) */
  useEffect(() => {
    const v = localStorage.getItem("hm69_logged_in") === "1";
    setLoggedIn(v);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("hm69_logged_in");
    setLoggedIn(false);
  }, []);

  /** 카드 클릭: 미로그인 → /login, 로그인 → /products 로 상품 전달 */
  const onClickProduct = useCallback(
    (p: Product) => {
      if (!loggedIn) {
        navigate("/login");
        return;
      }
      // 새로고침 대비로 세션에도 저장
      sessionStorage.setItem("hm69_last_product", JSON.stringify(p));
      navigate("/products", { state: { product: p } });
    },
    [loggedIn, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Header69 loggedIn={loggedIn} onLogout={handleLogout} />

      {/* Product Grid */}
      <main className="flex-1 p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {mockProducts.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.03 }} // ✅ 과제 3번: hover 확대
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => onClickProduct(p)}
          >
            <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  loading="lazy"
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
        © 2025 H&amp;M Style Mock Page
      </footer>
    </div>
  );
}
