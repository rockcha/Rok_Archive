"use client";

import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/utils";

type Props = {
  id: number | string;
  title: string;
  checked?: boolean;
  disabledCheck?: boolean;
  onToggle?: (id: number | string, next: boolean) => void;
  onClickTitle?: (id: number | string) => void;
  rightMeta?: React.ReactNode; // 우측에 날짜/시간 등 길게 배치
};

export default function UpcomingRow({
  id,
  title,
  checked = false,
  disabledCheck = false,
  onToggle,
  onClickTitle,
  rightMeta,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2 rounded-lg border bg-white hover:bg-muted/50 transition-colors"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Checkbox
          checked={checked}
          disabled={disabledCheck}
          onCheckedChange={(v) => onToggle?.(id, Boolean(v))}
          className="cursor-pointer"
        />
        <button
          onClick={() => onClickTitle?.(id)}
          className="text-sm text-left truncate hover:underline"
          title={title}
        >
          {title || "(제목 없음)"}
        </button>
      </div>
      {rightMeta ? (
        <div className="ml-2 shrink-0 text-xs text-muted-foreground">
          {rightMeta}
        </div>
      ) : null}
    </div>
  );
}
