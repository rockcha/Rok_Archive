// src/widgets/HomeButton.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HomeButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 메인페이지("/")에서는 렌더 X
  if (pathname === "/") return null;

  const goHome = () => navigate("/");

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={goHome}
      aria-label="홈으로"
      title="홈으로"
      className=" cursor-pointer
      [&>svg]:!h-6 [&>svg]:!w-6 "
    >
      <Home className="text-neutral-600" aria-hidden="true" />
    </Button>
  );
}
