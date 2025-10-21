import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type Difficulty = "약" | "중" | "강";

export type ReactStudyTaskItemProps = {
  week: string; // "1주차"
  title: string; // 과제명
  dueDate: string; // "YYYY-MM-DD"
  difficulty: Difficulty;
  href?: string; // 이동 경로 (예: "/tasks/gaibawi-1-4")
  className?: string;
};

const difficultyTone: Record<Difficulty, string> = {
  약: "bg-orange-100 text-orange-700 border-orange-200",
  중: "bg-blue-100 text-blue-700 border-blue-200",
  강: "bg-red-100 text-red-700 border-red-200",
};

export default function ReactStudyTaskItem({
  week,
  title,
  dueDate,
  difficulty,
  href = "#",
  className,
}: ReactStudyTaskItemProps) {
  const Inner = (
    <Card
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(800px_400px_at_-10%_-10%,rgba(48,167,224,0.10),transparent_60%),radial-gradient(600px_300px_at_110%_10%,rgba(255,148,150,0.10),transparent_60%)]",
        className
      )}
    >
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        {/* Top rail */}
        <div className="flex items-start justify-between">
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 text-slate-700"
          >
            {week}
          </Badge>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
              difficultyTone[difficulty]
            )}
            aria-label={`난이도 ${difficulty}`}
            title={`난이도 ${difficulty}`}
          >
            {difficulty}
          </span>
        </div>

        {/* Title */}
        <div className="mt-4 line-clamp-3 text-balance text-lg font-semibold leading-snug sm:text-xl">
          {title}
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="size-4" aria-hidden />
            <span className="tabular-nums">{dueDate}</span>
          </div>
          <div className="opacity-70 transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link
      to={href}
      className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      {Inner}
    </Link>
  );
}
