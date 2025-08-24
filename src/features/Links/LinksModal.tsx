"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { toast } from "sonner";
import LinkCreateForm from "./LinkCreateForm";
import { ExternalLink } from "lucide-react";

export type LinkRow = {
  id: string;
  title: string;
  url: string;
  order: number | null;
  type_id: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LinkTypeRow = {
  id: number;
  title: string;
};

export default function LinksModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [types, setTypes] = useState<LinkTypeRow[]>([]);
  const [byType, setByType] = useState<Record<number, LinkRow[]>>({});
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // link_type 전체 로드
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase
        .from("link_type")
        .select("id, title")
        .order("id", { ascending: true });
      if (error) {
        toast.error("link_type 불러오기 실패: " + error.message);
        return;
      }
      setTypes(data ?? []);
    })();
  }, [open]);

  // 각 type_id 별 link 목록 로드
  const loadLinksForTypes = async (typeIds: number[]) => {
    setLoading(true);
    try {
      const result: Record<number, LinkRow[]> = {};
      // Supabase는 in() + order 조합도 가능하지만, 타입별로 순회하면 단순합니다.
      for (const tid of typeIds) {
        const { data, error } = await supabase
          .from("link")
          .select("id, title, url, order, type_id, created_at, updated_at")
          .eq("type_id", tid)
          .order("order", { ascending: true })
          .order("created_at", { ascending: true, nullsFirst: true });

        if (error) throw error;
        result[tid] = (data ?? []).sort((a, b) => {
          const ao = a.order ?? 0;
          const bo = b.order ?? 0;
          if (ao !== bo) return ao - bo;
          return (a.title || "").localeCompare(b.title || "");
        });
      }
      setByType(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "링크 목록 로드 실패";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // types 바뀔 때마다 링크 로드
  useEffect(() => {
    if (types.length) {
      loadLinksForTypes(types.map((t) => t.id));
    }
  }, [types]);

  // 등록 후 목록 리프레시 콜백
  const handleCreated = async () => {
    setShowCreate(false);
    if (types.length) await loadLinksForTypes(types.map((t) => t.id));
    toast.success("링크가 등록되었습니다.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>링크 모음</DialogTitle>
          <DialogDescription>
            link_type 별로 링크를 모아 한 번에 확인하고 이동할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* 좌측 하단 '링크 등록' 버튼 */}
          <div className="absolute left-0 -top-12">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreate((v) => !v)}
            >
              {showCreate ? "등록 닫기" : "링크 등록"}
            </Button>
          </div>
        </div>

        {/* 등록 폼 토글 */}
        {showCreate && (
          <div className="rounded-lg border p-4 bg-muted/30">
            <LinkCreateForm types={types} onCreated={handleCreated} />
          </div>
        )}

        {/* 타입 섹션들 */}
        <div className="space-y-8">
          {types.map((t) => {
            const items = byType[t.id] ?? [];
            return (
              <section key={t.id} className="space-y-3">
                <h3 className="text-lg font-bold">#{t.title}</h3>
                <Separator />
                {/* 가로 스크롤 영역 */}
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-3 pb-3">
                    {loading && items.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        로딩 중...
                      </div>
                    ) : items.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        아직 등록된 링크가 없어요.
                      </div>
                    ) : (
                      items.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2
                                     rounded border bg-card p-3
                                     hover:bg-accent hover:text-accent-foreground
                                     transition"
                          title={link.url}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {link.title}
                          </span>
                        </a>
                      ))
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            );
          })}
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
