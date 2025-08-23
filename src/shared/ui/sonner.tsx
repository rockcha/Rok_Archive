import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import type { ToasterProps } from "sonner";

type Props = ToasterProps & {
  /** 바깥 클릭 시 토스트 닫기 */
  closeOnOutsideClick?: boolean;
};

const Toaster = ({
  duration = 2000,
  position = "bottom-right",
  closeOnOutsideClick = true,
  ...props
}: Props) => {
  const { theme = "system" } = useTheme();

  useEffect(() => {
    if (!closeOnOutsideClick) return;

    const onDocClick = (e: MouseEvent) => {
      const toaster = document.querySelector("[data-sonner-toaster]");
      if (!toaster) return;

      const target = e.target as Node | null;
      // 토스트 영역 밖을 클릭한 경우에만 닫기
      if (target && !toaster.contains(target)) {
        toast.dismiss(); // 현재 떠있는 모든 토스트 닫기
      }
    };

    // 캡처 단계에서 먼저 감지 (원치 않으면 false로 변경)
    document.addEventListener("pointerdown", onDocClick, true);
    return () => document.removeEventListener("pointerdown", onDocClick, true);
  }, [closeOnOutsideClick]);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      duration={duration}
      position={position}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          zIndex: 9999,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
