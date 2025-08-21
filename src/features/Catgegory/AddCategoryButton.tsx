// src/features/categories/CategoryAddButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Tag, Plus } from "lucide-react";

type CategoryType = { id: number; type: string };

export default function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase
        .from("categories_type")
        .select("id, type")
        .order("id", { ascending: true });

      if (error) {
        toast.error("타입 목록을 불러오지 못했습니다.", {
          description: error.message,
        });
        setTypes([]);
        return;
      }

      const rows = (data ?? []) as CategoryType[];
      setTypes(rows);
      if (rows.length && !selectedTypeId) {
        setSelectedTypeId(String(rows[0].id));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const n = name.trim();
    if (!n) {
      toast("카테고리 이름을 입력하세요.");
      return;
    }
    if (n.length > 60) {
      toast.error("카테고리 이름이 너무 깁니다(최대 60자).");
      return;
    }
    if (!selectedTypeId) {
      toast("카테고리 타입을 선택하세요.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: n, type_id: Number(selectedTypeId) };
      const { error } = await supabase
        .from("categories")
        .insert(payload)
        .select("id, name, type_id")
        .single();

      if (error) throw error;

      toast.success("카테고리가 추가되었습니다.");
      setName("");
      if (types.length) setSelectedTypeId(String(types[0].id));
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "추가에 실패했습니다.";
      toast.error("추가 중 오류가 발생했습니다.", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="카테고리 추가"
          title="카테고리 추가"
          className="
            group cursor-pointer hover:cursor-pointer
            px-3 py-2 rounded-xl
            text-neutral-700 dark:text-neutral-200
            hover:text-neutral-700 dark:hover:text-neutral-200  /* ✅ 텍스트 색 고정 */
            transition-transform duration-200
            hover:scale-[1.03] active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60
            hover:bg-transparent data-[state=open]:bg-transparent
            motion-reduce:transform-none "
        >
          {/* 아이콘만 살짝 점프 */}
          <span
            className="
              mr-2 inline-flex items-center
              transition-transform duration-200
              group-hover:-translate-y-0.5
              motion-reduce:transform-none
            "
          >
            <Tag className="h-4 w-4" />
          </span>

          {/* ✅ 텍스트는 호버 영향 없음 */}
          <span className="text-sm font-semibold">카테고리 추가</span>

          {/* 아이콘만 살짝 점프 */}
          <span
            className="
              ml-2 inline-flex items-center
              transition-transform duration-200
              group-hover:translate-y-0.5
              motion-reduce:transform-none
            "
          >
            <Plus className="h-4 w-4" />
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>카테고리 추가</DialogTitle>
          <DialogDescription>
            이름과 타입을 선택해 새 카테고리를 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="cat-name">이름</Label>
            <Input
              id="cat-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) React, TypeScript"
              disabled={saving}
              className="h-11 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-type">타입</Label>
            <Select
              value={selectedTypeId}
              onValueChange={setSelectedTypeId}
              disabled={saving || types.length === 0}
            >
              <SelectTrigger
                id="cat-type"
                className="h-11 hover:cursor-pointer"
              >
                <SelectValue
                  placeholder={types.length ? "타입 선택" : "불러오는 중…"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {types.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={String(t.id)}
                    className="hover:cursor-pointer"
                  >
                    {t.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="hover:cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="hover:cursor-pointer"
            >
              {saving ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
