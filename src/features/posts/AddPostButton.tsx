// src/features/posts/AddPostButton.tsx
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

type Props = {
  to?: string; // 기본: /posts/new
  floating?: boolean; // FAB
  className?: string;
  label?: string; // 기본: "글 추가"
  isAdmin?: boolean; // ✅ 관리자 모드 여부 (기본 false)
};

export default function AddPostButton({
  to = "/posts/new",
  floating = false,
  className,
  label = "글 추가",
  isAdmin = false,
}: Props) {
  const guard: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!isAdmin) {
      e.preventDefault();
      alert("관리자 모드가 아닙니다.");
    }
  };

  return (
    <Button
      asChild
      className={cn(
        floating
          ? // ✅ z-index 올리고, 아이콘+텍스트가 들어가도록 너비/패딩 조정
            "fixed bottom-4 right-6 z-50 h-12 rounded-full px-4 shadow-lg"
          : "",
        className
      )}
    >
      <Link to={to} aria-label={label} onClick={guard}>
        {/* ✅ floating일 때도 아이콘+텍스트 함께 노출 */}
        <div className="flex items-center gap-2">
          <Plus size={18} />
          <span>{floating ? "글 쓰기" : label}</span>
        </div>
      </Link>
    </Button>
  );
}
