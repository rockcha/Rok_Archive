// src/components/CreateHancomAiPostButton.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { useAdmin } from "@/features/Auth/useAdmin"; // ← 경로 확인!

/* 기본 설정 */
const TABLE_NAME = "posts";
const CATEGORY_COL = "category_id";

/* TipTap 타입(필요한 부분만) */
type PMText = { type: "text"; text: string };
type PMHeading = {
  type: "heading";
  attrs?: { level: number };
  content?: PMNode[];
};
type PMParagraph = { type: "paragraph"; content?: PMNode[] };
type PMHr = { type: "horizontalRule" };
type PMUnknownNode = { type: string; [k: string]: unknown };
type PMNode = PMText | PMHeading | PMParagraph | PMHr | PMUnknownNode;
type PMDoc = { type: "doc"; content: PMNode[] };

type PostRow = {
  id: string;
  title: string;
  content_json: PMDoc | null;
  created_at: string; // UTC
  category_id: number | null;
};
type CategoryRow = { id: number; name: string };

/* ──────────────────────────────
   한국시간(KST) 유틸
   ────────────────────────────── */
// YYYY-MM-DD (Asia/Seoul)
function ymdKST(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
// 이번 달 1일 (KST)
function firstDayOfMonthKST(): string {
  const today = ymdKST();
  const [y, m] = today.split("-");
  return `${y}-${m}-01`;
}
// KST 구간을 UTC ISO로 변환해서 반환
function isoRangeKST(startYmd: string, endYmd: string) {
  const start = new Date(`${startYmd}T00:00:00+09:00`);
  const end = new Date(`${endYmd}T23:59:59.999+09:00`);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function slugifyKorean(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^0-9A-Za-z\uAC00-\uD7A3-]+/g, "")
    .toLowerCase();
}
const toSafeJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

/** id 중복 제거 + created_at 오름차순 보장 */
function normalizePosts(rows: PostRow[]): PostRow[] {
  const map = new Map<string, PostRow>();
  for (const r of rows) if (!map.has(r.id)) map.set(r.id, r);
  const list = Array.from(map.values());
  list.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return list;
}

/** 카테고리 이름 맵 */
async function fetchCategoryMap(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .in("id", ids);
  if (error || !data) return new Map();
  return new Map((data as CategoryRow[]).map((c) => [c.id, c.name]));
}

/** 슬러그 중복 방지 */
async function ensureUniqueSlug(base: string): Promise<string> {
  const trimmed = base.slice(0, 180);
  const { data } = await supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("slug", trimmed)
    .maybeSingle();
  if (!data) return trimmed;
  return `${trimmed}-v2`.slice(0, 190);
}

/** TipTap 문서 합치기: 각 글을 h2 + 메타 + 본문 + 간격 + HR 로 구성 */
function buildMergedDoc(
  posts: PostRow[],
  catMap: Map<number, string>,
  headingLevel = 2
): PMDoc {
  const doc: PMDoc = { type: "doc", content: [] };

  for (const p of posts) {
    const nodes: PMNode[] = Array.isArray(p.content_json?.content)
      ? (p.content_json!.content as PMNode[])
      : [
          {
            type: "paragraph",
            content: [{ type: "text", text: "(내용 없음)" }],
          },
        ];

    const createdYmd = ymdKST(new Date(p.created_at));
    const categoryName =
      (p.category_id != null && catMap.get(p.category_id)) ||
      (p.category_id != null ? `#${p.category_id}` : "Uncategorized");

    // 제목(H2)
    doc.content.push({
      type: "heading",
      attrs: { level: headingLevel },
      content: [{ type: "text", text: p.title }],
    });

    // 메타(작성일/카테고리)
    doc.content.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `작성: ${createdYmd} • 카테고리: ${categoryName}`,
        },
      ],
    });

    // 간격(빈 텍스트 노드 금지 → 빈 문단만)
    doc.content.push({ type: "paragraph" });

    // 본문
    doc.content.push(...nodes);

    // 간격 + 구분선 + 간격
    doc.content.push({ type: "paragraph" });
    doc.content.push({ type: "horizontalRule" });
    doc.content.push({ type: "paragraph" });
  }

  // 맨 끝 여분 제거
  while (doc.content.length) {
    const last = doc.content[doc.content.length - 1];
    if (last.type === "horizontalRule" || last.type === "paragraph")
      doc.content.pop();
    else break;
  }
  return doc;
}

/* ──────────────────────────────
   컴포넌트
   ────────────────────────────── */
export default function CreateHancomAiPostButton() {
  const { isAdmin } = useAdmin();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // KST 기준 기본 기간: 이번달 1일 ~ 오늘
  const defaultStart = useMemo(() => firstDayOfMonthKST(), []);
  const defaultEnd = useMemo(() => ymdKST(), []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  // 제목 자동 구성: "한컴 AI 아카데미 학습일지 [ start ~ end ]"
  const buildTitle = (s: string, e: string) =>
    `한컴 AI 아카데미 학습일지 [ ${s} ~ ${e} ]`;
  const [title, setTitle] = useState(buildTitle(defaultStart, defaultEnd));

  // 기간이 바뀌면 제목의 [기간] 자동 갱신
  useEffect(() => {
    setTitle(buildTitle(startDate, endDate));
  }, [startDate, endDate]);

  const onCreate = async () => {
    // 1) 권한 체크
    if (!isAdmin) {
      toast.error("이 기능은 관리자만 사용할 수 있어요.");
      return;
    }

    // 2) 입력 검증
    if (!startDate || !endDate) return toast.error("기간을 선택해 주세요.");
    if (endDate < startDate)
      return toast.error("종료일이 시작일보다 빠릅니다.");
    if (!title.trim()) return toast.error("새 글의 제목을 입력해 주세요.");
    if (saving) return;

    setSaving(true);
    try {
      // 3) 기간 내 posts 조회 — KST 구간 → UTC ISO로 변환
      const { startIso, endIso } = isoRangeKST(startDate, endDate);
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id,title,content_json,created_at,category_id")
        .gte("created_at", startIso)
        .lte("created_at", endIso)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const posts = normalizePosts((data ?? []) as PostRow[]);
      if (posts.length === 0) {
        toast("해당 기간에 작성된 글이 없습니다.");
        setSaving(false);
        return;
      }

      // 4) 카테고리 이름 로드
      const catIds = Array.from(
        new Set(
          posts.map((p) => p.category_id).filter((v): v is number => v != null)
        )
      );
      const catMap = await fetchCategoryMap(catIds);

      // 5) 문서 병합 → 안전 JSON
      const mergedDoc = buildMergedDoc(posts, catMap, 2);
      const safeDoc = toSafeJson(mergedDoc);

      // 6) 저장 (카테고리 8, 슬러그 중복 방지) — KST 오늘 기준으로 슬러그
      const nowIso = new Date().toISOString();
      const baseSlug = `${ymdKST()}-${slugifyKorean(title)}`;
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      const insertPayload = {
        title,
        slug: uniqueSlug,
        [CATEGORY_COL]: 8,
        content_json: safeDoc,
        published_at: nowIso,
        updated_at: nowIso,
      };

      const { error: insErr } = await supabase
        .from(TABLE_NAME)
        .insert([insertPayload])
        .select("id")
        .single();

      if (insErr) throw insErr;

      toast.success(`"${title}" 저장 완료! (총 ${posts.length}개 글 통합)`);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          if (!isAdmin) {
            toast.error("이 기능은 관리자만 사용할 수 있어요.");
            return;
          }
          setOpen(true);
        }}
        className="hover:cursor-pointer"
        // UI로도 권한 상태 전달(회색 처리)
        disabled={!isAdmin}
      >
        <Plus className="mr-2 h-4 w-4" />
        한컴 AI 학습일지 만들기
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>학습일지 제작하기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">시작일 (KST)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1 block">종료일 (KST)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-1 block"> 제목</Label>
              <Input
                placeholder="한컴 AI 아카데미 학습일지 [ 2025-09-01 ~ 2025-09-20 ]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              onClick={onCreate}
              disabled={saving || !isAdmin}
              className="gap-1"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
