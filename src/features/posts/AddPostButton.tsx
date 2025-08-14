// src/features/posts/AddPostButton.tsx
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

type Props = {
  to?: string; // 이동 경로 (기본: /posts/new)
  floating?: boolean; // 오른쪽 하단 떠있는 FAB로 표시
  className?: string;
  label?: string; // 텍스트 라벨 (기본: "글 추가")
};

export default function AddPostButton({
  to = "/posts/new",
  floating = false,
  className,
  label = "글 추가",
}: Props) {
  return (
    <Button
      asChild
      className={cn(
        floating
          ? "fixed bottom-6 right-6 h-12 w-12 rounded-full p-0 shadow-lg"
          : "",
        className
      )}
    >
      <Link to={to} aria-label={label}>
        {floating ? (
          <Plus />
        ) : (
          <div className="flex items-center gap-2">
            <Plus size={18} />
            <span>{label}</span>
          </div>
        )}
      </Link>
    </Button>
  );
}
