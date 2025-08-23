// src/features/posts/SavePostButton.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { Save } from "lucide-react";

export default function SavePostButton({
  onClick,

  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
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
