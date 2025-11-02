// src/pages/Contacts18.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

/* shadcn/ui (모두 '@/shared/ui/*' 경로) */
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

/* Icons */
import {
  Phone,
  User,
  Star,
  StarOff,
  Trash2,
  Edit2,
  Copy,
  Search,
  PlusCircle,
} from "lucide-react";

/* toast(optional) */
import { toast } from "sonner";

/* ==================== Types & Utils ==================== */
type Contact = {
  id: string;
  name: string;
  phone: string;
  favorite?: boolean;
  createdAt: number;
};

/** 010-1234-5678 간단 포맷터 */
function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/** 이름 2자+, 번호 9~11자리 숫자 */
function validateContact({ name, phone }: { name: string; phone: string }) {
  const nameOk = name.trim().length >= 2;
  const num = phone.replace(/\D/g, "");
  const phoneOk = num.length >= 9 && num.length <= 11;
  return { ok: nameOk && phoneOk, nameOk, phoneOk };
}

/* ==================== Main Component ==================== */
export default function Contacts18() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  /* 첫 마운트 시 포커스 정도만 유지 */
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  /* ---- Derived list (search + sort) ---- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? contacts.filter((c) => c.name.toLowerCase().includes(q))
      : contacts.slice();
    return base.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.name.localeCompare(b.name, "ko");
    });
  }, [contacts, search]);

  /* ---- Handlers ---- */
  const handleAdd = () => {
    const payload = { name: name.trim(), phone: phone.trim() };
    const v = validateContact(payload);
    if (!v.ok) {
      if (!v.nameOk) toast.error("이름은 2자 이상으로 입력해 주세요.");
      else if (!v.phoneOk) toast.error("전화번호는 숫자 9~11자리여야 해요.");
      return;
    }
    const exists = contacts.some(
      (c) =>
        c.name.trim() === payload.name ||
        c.phone.replace(/\D/g, "") === payload.phone.replace(/\D/g, "")
    );
    if (exists)
      return toast.warning("이미 동일한 이름 또는 전화번호가 있어요.");

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: payload.name,
      phone: formatPhone(payload.phone),
      favorite: false,
      createdAt: Date.now(),
    };
    setContacts((prev) => [newContact, ...prev]);
    setName("");
    setPhone("");
    toast.success("연락처를 추가했어요.");
    nameRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success("삭제했어요.");
  };

  const toggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("전화번호 복사 완료!");
    } catch {
      toast.error("복사 실패");
    }
  };

  /* ---- Edit Dialog ---- */
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  useEffect(() => {
    if (editing) {
      setEditName(editing.name);
      setEditPhone(editing.phone);
    }
  }, [editing]);

  const commitEdit = () => {
    if (!editing) return;
    const payload = { name: editName.trim(), phone: editPhone.trim() };
    const v = validateContact(payload);
    if (!v.ok) return toast.error("수정 값이 유효하지 않아요.");

    const exists = contacts.some(
      (c) =>
        c.id !== editing.id &&
        (c.name.trim() === payload.name ||
          c.phone.replace(/\D/g, "") === payload.phone.replace(/\D/g, ""))
    );
    if (exists) return toast.warning("다른 연락처와 이름/번호가 중복됩니다.");

    setContacts((prev) =>
      prev.map((c) =>
        c.id === editing.id
          ? { ...c, name: payload.name, phone: formatPhone(payload.phone) }
          : c
      )
    );
    setEditing(null);
    toast.success("수정했어요.");
  };

  /* ---- UI ---- */
  return (
    <TooltipProvider>
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Card className="border-none shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl tracking-tight">
                  📒 Contacts 18
                </CardTitle>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                총 {contacts.length}명
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ---------- Add Form ---------- */}
            <div className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-1.5">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    ref={nameRef}
                    placeholder="예) 김연락"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    placeholder="예) 01012345678"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full gap-2"
                    onClick={handleAdd}
                    aria-label="연락처 추가"
                  >
                    <PlusCircle className="size-4" />
                    추가
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>• 이름 2자 이상</span>
                  <span>• 번호 9~11자리</span>
                </div>
              </div>
            </div>

            {/* ---------- Search ---------- */}
            <div className="flex items-center gap-2 rounded-xl border bg-white p-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                className="border-none shadow-none focus-visible:ring-0"
                placeholder="이름으로 검색…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Separator />

            {/* ---------- List ---------- */}
            {filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              <ScrollArea className="max-h-[60vh] pr-2">
                <ul className="grid gap-2">
                  {filtered.map((c) => (
                    <li
                      key={c.id}
                      className={cn(
                        "group rounded-xl border bg-white/70 p-3 transition hover:bg-white",
                        c.favorite && "ring-2 ring-amber-300"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid aspect-square size-10 place-items-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700">
                            <User className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium">{c.name}</p>
                              {c.favorite && (
                                <Badge className="rounded-full bg-amber-500/15 text-amber-700">
                                  ★ 즐겨찾기
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="size-3.5" />
                              <span className="truncate">{c.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          <IconBtn
                            label={c.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                            onClick={() => toggleFavorite(c.id)}
                          >
                            {c.favorite ? (
                              <Star className="size-4 fill-amber-400 text-amber-500" />
                            ) : (
                              <StarOff className="size-4" />
                            )}
                          </IconBtn>

                          <a href={`tel:${c.phone.replace(/\D/g, "")}`}>
                            <IconBtn label="전화 걸기">
                              <Phone className="size-4" />
                            </IconBtn>
                          </a>

                          <IconBtn
                            label="번호 복사"
                            onClick={() => handleCopy(c.phone)}
                          >
                            <Copy className="size-4" />
                          </IconBtn>

                          <IconBtn label="수정" onClick={() => setEditing(c)}>
                            <Edit2 className="size-4" />
                          </IconBtn>

                          <IconBtn
                            className="text-red-500 hover:text-red-600"
                            label="삭제"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="size-4" />
                          </IconBtn>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* ---------- Edit Dialog ---------- */}
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>연락처 수정</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">이름</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">전화번호</Label>
                <Input
                  id="edit-phone"
                  inputMode="numeric"
                  value={editPhone}
                  onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button onClick={commitEdit}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* ==================== Small UI Helpers ==================== */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border bg-white/70 p-10 text-center">
      <div className="text-5xl">📭</div>
      <p className="mt-2 text-lg font-medium">연락처가 비어 있어요</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {query
          ? `"${query}" 검색 결과가 없습니다.`
          : "상단 폼에서 추가해 보세요."}
      </p>
    </div>
  );
}

function IconBtn({
  children,
  label,
  className,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
