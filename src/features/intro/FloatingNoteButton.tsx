// src/features/common/FloatingNoteButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { AlertTriangle } from "lucide-react";

type Props = {
  title?: string; // 모달 제목
  children?: React.ReactNode; // 모달 본문에 들어갈 내용
  className?: string; // 버튼 추가 커스텀
  offset?: { bottom?: number; right?: number }; // 위치 미세조정
};

export default function FloatingNoteButton({
  title = "참고사항",
  children,
  className,
  offset = { bottom: 3, right: 3 },
}: Props) {
  const [open, setOpen] = useState(false);

  const style = {
    bottom: `var(--b, ${offset.bottom ?? 6}rem)`,
    right: `var(--r, ${offset.right ?? 6}rem)`,
  } as React.CSSProperties;

  return (
    <>
      {/* FAB */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="참고사항 열기"
        className={[
          "fixed z-50 rounded-full p-0 h-12 w-12 shadow-lg",
          "bottom-6 right-6 hover:cursor-pointer", // hover cursor
          className ?? "",
        ].join(" ")}
        style={style}
      >
        <AlertTriangle className="h-6 w-6 text-white drop-shadow" />
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {/* 필요하면 여기에 한 줄 보조설명 */}
            </DialogDescription>
          </DialogHeader>

          {/* === 본문 === */}
          <div className="space-y-2 text-base text-neutral-700 font-semibold dark:text-neutral-300">
            {children ?? (
              <>
                <p className="opacity-80">
                  🚧 아직 최종 완성 단계는 아닌 임시 사이트들입니다.
                  참고해주세요.
                </p>
                <p className="opacity-80">
                  ⚠️ 잘못하면 서버 데이터에 영향을 줄 수 있습니다. 조심해주세요
                  ㅠ
                </p>

                <p className="opacity-80">
                  🚨 휴대폰으로 보면 UI가 깨질 수 있습니다.
                </p>
                <p className="opacity-80">
                  💡 지식 공유는 언제나 환영입니다. 버그 제보도 부탁드릴게요!
                </p>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              className="hover:cursor-pointer"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
