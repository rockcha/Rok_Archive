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
import { Plus } from "lucide-react";

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
    if (!n) return toast("카테고리 이름을 입력하세요.");
    if (n.length > 60)
      return toast.error("카테고리 이름이 너무 깁니다(최대 60자).");
    if (!selectedTypeId) return toast("카테고리 타입을 선택하세요.");

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
          variant="ghost" // ✅ ghost 기본 hover 사용
          aria-label="카테고리 추가"
          title="카테고리 추가"
          className="
            cursor-pointer                  /* ✅ 포인터 */
            px-3 py-2 rounded-xl
            inline-flex items-center gap-2
            transition-colors
            /* fallback이 필요하면 아래 한 줄 주석 해제:
               hover:bg-accent/20 hover:text-accent-foreground
            */
          "
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-semibold">카테고리 추가</span>
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
              <SelectTrigger id="cat-type" className="h-11">
                <SelectValue
                  placeholder={types.length ? "타입 선택" : "불러오는 중…"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {types.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
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
            >
              취소
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
