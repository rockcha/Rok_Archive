// src/features/posts/SavePostButton.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Save } from "lucide-react";
import { useAdmin } from "@/features/Auth/useAdmin";
import { toast } from "sonner";

export default function SavePostButton({
  onClick,
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  const { isAdmin } = useAdmin();

  const handleClick = () => {
    if (!isAdmin) {
      toast.error("관리자만 게시글을 저장할 수 있습니다.");
      return;
    }
    onClick();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className={`
        px-3 py-2
        cursor-pointer
        [&>svg]:!h-6 [&>svg]:!w-6
        ${className ?? ""}
      `}
    >
      <Save className="text-neutral-600" />
    </Button>
  );
}
