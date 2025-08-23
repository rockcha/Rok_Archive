// src/features/categories/CategoryAddButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/shared/ui/sheet";
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
import { useAdmin } from "@/features/Auth/useAdmin"; // ✅ 추가

type CategoryType = { id: number; type: string };

export default function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAdmin(); // ✅ 관리자 여부

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

    // ✅ 관리자 체크 (최소 변경)
    if (!isAdmin) {
      toast.error("권한 없음", {
        description: "관리자만 카테고리를 추가할 수 있습니다.",
      });
      return;
    }

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
    <Sheet open={open} onOpenChange={(v) => !saving && setOpen(v)}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="카테고리 추가"
          title="카테고리 추가"
          className="
            cursor-pointer
            px-3 py-2 rounded-xl
            inline-flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          <span className="text-base font-semibold">카테고리 추가</span>
        </Button>
      </SheetTrigger>

      {/* ✅ 왼쪽 시트, 중앙 정렬 + 폭 일치 */}
      <SheetContent side="left" className="p-0 sm:max-w-md">
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="w-full max-w-md">
            <SheetHeader className="p-0 mb-4 text-xl text-center">
              <SheetTitle>카테고리 추가</SheetTitle>
              <SheetDescription>
                이름과 타입을 선택해 새 카테고리를 추가합니다.
              </SheetDescription>
            </SheetHeader>

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
                  className="h-11 text-base w-full"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cat-type">타입</Label>
                <Select
                  value={selectedTypeId}
                  onValueChange={setSelectedTypeId}
                  disabled={saving || types.length === 0}
                >
                  <SelectTrigger id="cat-type" className="h-11 w-full">
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

              <SheetFooter className="mt-0 p-0 pt-6 flex-row justify-center gap-2">
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    className="hover:cursor-pointer"
                  >
                    닫기
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  disabled={saving}
                  className="hover:cursor-pointer"
                >
                  {saving ? "추가 중..." : "추가"}
                </Button>
              </SheetFooter>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
