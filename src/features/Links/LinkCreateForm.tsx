"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { LinkTypeRow } from "./LinksModal";

export default function LinkCreateForm({
  types,
  onCreated,
}: {
  types: LinkTypeRow[];
  onCreated?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // 간단 검증
  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!url.trim()) return false;
    if (!typeId) return false;
    return true;
  }, [title, url, typeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const orderNum =
        order.trim() === ""
          ? null
          : Number.isNaN(Number(order))
          ? null
          : Number(order);

      const payload = {
        title: title.trim(),
        url: url.trim(),
        order: orderNum,
        type_id: Number(typeId),
      };

      const { error } = await supabase.from("link").insert([payload]);
      if (error) throw error;

      setTitle("");
      setUrl("");
      setOrder("");
      setTypeId("");

      onCreated?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "등록 실패";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-4 gap-3"
    >
      <div className="space-y-1">
        <Label htmlFor="link-title">제목</Label>
        <Input
          id="link-title"
          placeholder="예) 인프런 - 타입스크립트 강의"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="link-order">표시 순서 (선택)</Label>
        <Input
          id="link-order"
          placeholder="숫자"
          inputMode="numeric"
          value={order}
          onChange={(e) => setOrder(e.currentTarget.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>타입</Label>
        <Select value={typeId} onValueChange={setTypeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-3 flex items-end gap-2">
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? "등록 중..." : "등록"}
        </Button>
      </div>
    </form>
  );
}
