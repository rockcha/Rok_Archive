// Shop1013.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* shadcn */
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

/* icons */
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
  Menu,
  ArrowLeft,
} from "lucide-react";

/** 옵션: '지속가능성' 메뉴 표시 */
const CONSCIOUS_CHOICE = true;

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  desc?: string;
  category: "WOMEN" | "DIVIDED" | "MEN" | "BABY" | "KIDS" | "HOME" | "SALE";
};

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "벨티드 트렌치 코트",
    price: 99000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    desc: "클래식 더블브레스트와 허리 벨트 디테일의 방풍 코튼 블렌드.",
    category: "WOMEN",
  },
  {
    id: 2,
    name: "하이웨이스트 와이드 진",
    price: 29900,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    desc: "탄탄한 논스트레치 데님, 롱 레그 라인.",
    category: "DIVIDED",
  },
  {
    id: 3,
    name: "니트 가디건",
    price: 39900,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80",
    desc: "소프트 터치 울혼방, 여유핏 데일리 가디건.",
    category: "MEN",
  },
  {
    id: 4,
    name: "플로럴 원피스",
    price: 49900,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    desc: "가벼운 쉬폰, 스모킹 웨이스트.",
    category: "WOMEN",
  },
  {
    id: 5,
    name: "오버사이즈 셔츠",
    price: 25900,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    desc: "브로드클로스 코튼, 루즈 핏 레이어드템.",
    category: "MEN",
  },
  {
    id: 6,
    name: "캐시미어 머플러",
    price: 19900,
    image: "https://picsum.photos/seed/cashmere-scarf-69/1200/1200",
    desc: "라이트 캐시미어 블렌드.",
    category: "SALE",
  },
  {
    id: 7,
    name: "가죽 자켓",
    price: 89900,
    image: "https://picsum.photos/seed/leather-jacket-69/1200/1200",
    desc: "미니멀 바이커 디테일, 세미 크롭.",
    category: "MEN",
  },
  {
    id: 8,
    name: "플리츠 스커트",
    price: 34900,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    desc: "미세 플리츠, 경량 폴리 혼방.",
    category: "DIVIDED",
  },
];

/* ----------------------------- 공용 헤더 ----------------------------- */
function TopNav({
  loggedIn,
  onLogin,
  onLogout,
  query,
  setQuery,
  onLogoClick,
}: {
  loggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  query: string;
  setQuery: (v: string) => void;
  onLogoClick: () => void;
}) {
  /* 데스크톱용 가로 메뉴 */
  const DesktopCategoryList = () => (
    <ul className="hidden md:flex flex-wrap gap-3 text-sm text-gray-700">
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
      {CONSCIOUS_CHOICE && (
        <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-50 cursor-pointer transition">
          <Leaf className="w-4 h-4 text-emerald-500" />
          지속가능성
        </li>
      )}
    </ul>
  );

  /* 모바일용 세로 메뉴(한 줄씩) */
  const MobileCategoryList = () => (
    <ul className="flex flex-col">
      {[
        { icon: <Heart className="w-4 h-4" />, label: "여성" },
        { icon: <Shirt className="w-4 h-4" />, label: "Divided" },
        { icon: <Shirt className="w-4 h-4" />, label: "남성" },
        { icon: <Baby className="w-4 h-4" />, label: "신생아/유아" },
        { icon: <Baby className="w-4 h-4" />, label: "아동" },
        { icon: <Home className="w-4 h-4" />, label: "H&M HOME" },
        { icon: <BadgePercent className="w-4 h-4" />, label: "Sale" },
        ...(CONSCIOUS_CHOICE
          ? [
              {
                icon: <Leaf className="w-4 h-4 text-emerald-600" />,
                label: "지속가능성",
              },
            ]
          : []),
      ].map((item, i) => (
        <li key={i} className="py-1.5">
          <button className="w-full flex items-center gap-2 px-3 py-3 rounded-xl border hover:bg-rose-50 active:scale-[0.99] transition">
            {item.icon}
            <span className="text-[15px]">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="flex flex-col gap-3 px-4 md:px-8 py-4 border-b bg-white/70 backdrop-blur-sm sticky top-0 z-20">
      {/* 상단 줄: 모바일 햄버거 + 로고, 우측 로그(in/out) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* 모바일 사이드 메뉴 트리거 */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2" aria-label="메뉴 열기">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-rose-500">H&amp;M</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-6">
                  <MobileCategoryList />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <h1
            role="button"
            aria-label="H&M 로고 (전체 상품 페이지로 이동)"
            className="text-2xl md:text-3xl font-semibold text-rose-500 tracking-tight cursor-pointer select-none"
            onClick={onLogoClick}
          >
            H&amp;M
          </h1>
        </div>

        {/* 로그인/로그아웃 */}
        <div className="flex items-center gap-2 md:gap-3">
          {!loggedIn ? (
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-rose-500"
              onClick={onLogin}
            >
              <LogIn className="mr-2 h-4 w-4" />
              로그인
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-rose-500"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          )}
        </div>
      </div>

      {/* 데스크톱 카테고리 */}
      <nav>
        <DesktopCategoryList />
      </nav>

      {/* 검색 */}
      <section className="pt-1 pb-2">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 봄 원피스, 린넨 셔츠, 와이드 진, 로퍼…"
              className="h-12 rounded-2xl pl-12 pr-4 shadow-sm ring-1 ring-rose-100 focus-visible:ring-rose-300"
              aria-label="상품 검색"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
            <Button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-5 bg-rose-500 hover:bg-rose-600"
            >
              검색
            </Button>
          </div>
        </div>
      </section>
    </header>
  );
}

/* ----------------------------- 디테일 ----------------------------- */
function ProductDetail({
  product,
  onBack,
  onClickRelated,
  all,
}: {
  product: Product;
  onBack: () => void;
  onClickRelated: (p: Product) => void;
  all: Product[];
}) {
  // 간단한 추천 로직:
  // 1) 같은 카테고리 우선
  // 2) 부족하면 이름 키워드(단어 겹침)
  // 3) 그래도 부족하면 ±20% 가격대
  const related = useMemo(() => {
    const base = new Set<number>();
    const sameCat = all.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    sameCat.forEach((p) => base.add(p.id));

    if (base.size < 4) {
      const words = product.name.toLowerCase().split(/\s+/);
      const kw = all.filter(
        (p) =>
          p.id !== product.id &&
          words.some((w) => p.name.toLowerCase().includes(w))
      );
      kw.forEach((p) => base.add(p.id));
    }

    if (base.size < 4) {
      const min = product.price * 0.8;
      const max = product.price * 1.2;
      const priceNear = all.filter(
        (p) => p.id !== product.id && p.price >= min && p.price <= max
      );
      priceNear.forEach((p) => base.add(p.id));
    }

    const arr = all.filter((p) => base.has(p.id)).slice(0, 4);
    return arr;
  }, [all, product]);

  return (
    <main className="flex-1 px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-rose-500"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Button>

        {/* 모바일 1열 / 데스크톱 2열 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 */}
          <div className="w-full">
            <div className="aspect-square rounded-2xl overflow-hidden border bg-white">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* 정보 */}
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              카테고리 · {product.category}
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {product.name}
            </h2>
            <p className="text-rose-600 text-xl md:text-2xl font-medium">
              ₩{product.price.toLocaleString()}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {product.desc ??
                "데일리로 활용하기 좋은 베이식 아이템. 다양한 스타일링에 매치해보세요."}
            </p>

            <div className="flex gap-2 pt-2">
              <Button className="bg-rose-500 hover:bg-rose-600">
                장바구니
              </Button>
              <Button variant="outline" className="border-rose-200">
                위시리스트
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border p-3">
                소재: 코튼/폴리 블렌드
              </div>
              <div className="rounded-xl border p-3">배송: 평균 2~3일</div>
              <div className="rounded-xl border p-3">교환/반품: 7일 이내</div>
              <div className="rounded-xl border p-3">세탁: 손세탁 권장</div>
            </div>
          </div>
        </div>

        {/* 유사한 상품 */}
        {related.length > 0 && (
          <section className="mt-10">
            <h3 className="text-lg font-semibold mb-4">유사한 상품</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {related.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => onClickRelated(p)}
                >
                  <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="aspect-square overflow-hidden bg-white">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="p-3 pb-0 text-sm text-gray-800 font-medium">
                      {p.name}
                    </CardHeader>
                    <CardContent className="p-3 pt-1 text-gray-500 text-sm">
                      ₩{p.price.toLocaleString()}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ----------------------------- 리스트 ----------------------------- */
function ProductGrid({
  products,
  onClick,
}: {
  products: Product[];
  onClick: (p: Product) => void;
}) {
  return (
    <main className="flex-1 p-4 md:p-8">
      {/* 모바일: 1열(사진 한 장씩 세로), sm: 2열, lg: 4열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
        {products.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => onClick(p)}
          >
            <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-square overflow-hidden bg-white">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardHeader className="p-3 pb-0 text-sm text-gray-800 font-medium">
                {p.name}
              </CardHeader>
              <CardContent className="p-3 pt-1 text-gray-500 text-sm">
                ₩{p.price.toLocaleString()}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

/* ----------------------------- 페이지 ----------------------------- */
export default function Shop1013() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  // 로그인 유지
  useEffect(() => {
    const v = localStorage.getItem("hm1013_logged_in") === "1";
    setLoggedIn(v);
  }, []);

  // 로그인 → /login 으로 이동 (요청사항)
  const handleLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("hm1013_logged_in");
    setLoggedIn(false);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockProducts;
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.desc ?? "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  const openDetail = useCallback((p: Product) => {
    setSelected(p);
    sessionStorage.setItem("hm1013_last_product", JSON.stringify(p));
  }, []);

  const backToList = useCallback(() => {
    setSelected(null);
    navigate(".");
  }, [navigate]);

  const goHome = useCallback(() => {
    setSelected(null);
    setQuery("");
    navigate(".");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <TopNav
        loggedIn={loggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        query={query}
        setQuery={setQuery}
        onLogoClick={goHome}
      />

      {selected ? (
        <ProductDetail
          product={selected}
          onBack={backToList}
          onClickRelated={openDetail}
          all={mockProducts}
        />
      ) : (
        <ProductGrid products={filtered} onClick={openDetail} />
      )}

      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © 2025 H&amp;M Style Mock Page · 모바일 사이드 메뉴 &amp; 디테일 추천
        포함
      </footer>
    </div>
  );
}
