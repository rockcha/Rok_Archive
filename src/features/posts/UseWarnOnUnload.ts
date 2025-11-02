// src/features/posts/UseWarnOnClose.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * 창 닫기/새로고침만 막는 심플 훅
 * - 리스너는 한 번만 등록
 * - dirty 상태는 ref로만 추적 → 재등록/해제 반복으로 인한 경합 방지
 */
export function useWarnOnClose(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return; // 깨끗하면 통과
      // Chromium계열은 returnValue를 설정해야 기본 다이얼로그가 뜸
      e.preventDefault();
      e.returnValue = "";
    };

    // 한 번만 등록
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
