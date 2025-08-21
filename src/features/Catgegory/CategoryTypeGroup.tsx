// src/features/posts/CategoryTypeGroup.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import CategoryButton from "./CategoryButton";

type CategoryRow = {
  id: number;
  name: string;
  type_id: number;
};

export default function CategoryTypeGroup({
  typeId,
  typeLabel,
  selected,
  showAllActive,
  onSelectCategory,
  className,
}: {
  typeId: number;
  typeLabel: string;
  selected: number | null;
  showAllActive: boolean;
  onSelectCategory: (id: number) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count, error } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("type_id", typeId);
      setCount(error ? 0 : count ?? 0);
    })();
  }, [typeId]);

  const toggle = async () => {
    if (!open && !loaded) {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, type_id")
        .eq("type_id", typeId)
        .order("name", { ascending: true });

      if (!error) {
        const rows = (data ?? []) as CategoryRow[];
        setCats(rows);
        setLoaded(true);
        setCount(rows.length);
      }
      setLoading(false);
    }
    setOpen((v) => !v);
  };

  return (
    <div className={cn("rounded-md", className)}>
      {/* 라벨은 앞쪽(좌측) 고정, 우측 끝에 (개수) + ⌄ 아이콘 */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2 py-2 rounded-md",
          "text-sm text-neutral-800 dark:text-neutral-100",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:cursor-pointer"
        )}
        aria-expanded={open}
        aria-controls={`type-panel-${typeId}`}
      >
        {/* 좌측: 라벨(내용 길이만큼, 앞쪽 고정) */}
        <span className="text-base font-semibold">{typeLabel}</span>

        {/* 가운데: 유동 공간 */}
        <span aria-hidden className="block" />

        {/* 우측: (개수)와 펼치기 아이콘 - 살짝 간격 */}
        <span className="flex items-center gap-1 shrink-0">
          <span className="text-sm text-neutral-500">({count ?? 0})</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* 패널 */}
      <div
        id={`type-panel-${typeId}`}
        className={cn("pl-2 pr-1", open ? "block" : "hidden")}
      >
        {loading ? (
          <div className="px-2 py-2 text-xs text-zinc-500">불러오는 중…</div>
        ) : cats.length === 0 ? (
          <div className="px-2 py-2 text-xs text-zinc-500">항목 없음</div>
        ) : (
          <div className="flex flex-col gap-1 py-1">
            {cats.map((cat) => (
              <CategoryButton
                key={cat.id}
                id={cat.id}
                label={cat.name}
                selected={selected === cat.id && !showAllActive}
                onSelect={(id) => onSelectCategory(id as number)}
                className="shadow-md"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
