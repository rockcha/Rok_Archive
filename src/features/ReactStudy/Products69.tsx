"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { mockProducts } from "./Shop69";
import type { Product } from "./Shop69";
import { Heart, Share2 } from "lucide-react";

/** 공용 헤더를 그대로 쓰고 싶다면
 *  - Header69를 Shop69에서 export 하거나
 *  - 여기와 동일한 미니 헤더를 작성하세요.
 *  여기서는 간단히 동일 스타일의 미니 헤더를 작성합니다.
 */
function MiniHeader({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
      <h1
        className="text-3xl font-semibold text-rose-500 tracking-tight cursor-pointer"
        onClick={() => navigate("/")}
      >
        H&amp;M
      </h1>
      {loggedIn ? (
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-rose-500"
          onClick={onLogout}
        >
          로그아웃
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="text-gray-600 hover:text-rose-500"
          onClick={() => navigate("/login")}
        >
          로그인
        </Button>
      )}
    </header>
  );
}

export default function Products69() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { product?: Product } };
  const [loggedIn, setLoggedIn] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // 로그인 보호
  useEffect(() => {
    const v = localStorage.getItem("hm69_logged_in") === "1";
    setLoggedIn(v);
    if (!v) {
      navigate("/login");
    }
  }, [navigate]);

  // location.state 또는 sessionStorage에서 상품 복원
  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      sessionStorage.setItem(
        "hm69_last_product",
        JSON.stringify(location.state.product)
      );
      return;
    }
    const saved = sessionStorage.getItem("hm69_last_product");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product;
        setProduct(parsed);
      } catch {
        // ignore
      }
      return;
    }
    // 완전 새로 들어온 경우엔 메인으로
    navigate("/");
  }, [location.state, navigate]);

  const onLogout = useCallback(() => {
    localStorage.removeItem("hm69_logged_in");
    setLoggedIn(false);
    navigate("/");
  }, [navigate]);

  const fallbackName = useMemo(
    () => (product ? product.name : "상품"),
    [product]
  );

  if (!product) {
    return null; // 복원 중 잠깐
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <MiniHeader loggedIn={loggedIn} onLogout={onLogout} />

      <main className="flex-1 px-6 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
        {/* 이미지 영역 */}
        <Card className="overflow-hidden rounded-2xl shadow-sm">
          <div className="aspect-square overflow-hidden bg-white">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </Card>

        {/* 정보 영역 */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {product.name}
            </h2>
            <p className="mt-2 text-xl text-rose-600 font-medium">
              ₩{product.price.toLocaleString()}
            </p>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">
            데모용 상품 상세입니다. 실제 구매/옵션/재고 기능은 포함되지
            않았어요. 이미지 기준(정사각형 썸네일, 배경 흰색/크롭)과 기본
            인터랙션만 확인하면 됩니다.
          </p>

          <div className="flex gap-3">
            <Button className="bg-rose-500 hover:bg-rose-600">
              장바구니 담기
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> 위시리스트
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" /> 공유
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-rose-500"
              onClick={() => navigate("/tasks/shop-6-9")}
            >
              ← 목록으로 돌아가기
            </Button>
          </div>

          {/* 연관 상품 (데모) */}
          <section className="pt-2">
            <h3 className="text-lg font-semibold mb-3">비슷한 상품</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 3)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sessionStorage.setItem(
                        "hm69_last_product",
                        JSON.stringify(p)
                      );
                      navigate("/products", { state: { product: p } });
                    }}
                    className="text-left group"
                  >
                    <Card className="overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm text-gray-800 line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ₩{p.price.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © 2025 H&amp;M Style Mock Page — {fallbackName}
      </footer>
    </div>
  );
}
