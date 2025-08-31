// src/features/music/MusicCard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { PencilLine, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../Auth/useAdmin";
import { getYT, getYTReadyCb, setYTReadyCb, type YTPlayer } from "./yt-helpers";

/* ——— YouTube ID 파싱 ——— */
function extractYouTubeId(u: string): string | null {
  try {
    const s = u.trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2];
    const v = url.searchParams.get("v");
    return v ?? null;
  } catch {
    return null;
  }
}

/* ——— IFrame API 로더 ——— */
async function ensureYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return;
  if (getYT()?.Player) return;

  await new Promise<void>((resolve) => {
    const ex = document.getElementById("yt-iframe-api");
    if (ex) {
      if (getYT()?.Player) resolve();
      else {
        const prev = getYTReadyCb();
        setYTReadyCb(() => {
          prev?.();
          resolve();
        });
      }
      return;
    }
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    setYTReadyCb(() => resolve());
  });
}

export default function MusicCard() {
  const { isAdmin } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);

  // 편집 다이얼로그
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // 플레이 상태 (썸네일 ↔ 플레이어)
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isAudible, setIsAudible] = useState(false);

  const videoId = useMemo(() => (url ? extractYouTubeId(url) : null), [url]);
  const draftId = useMemo(
    () => (draft ? extractYouTubeId(draft) : null),
    [draft]
  );
  const thumb = useMemo(
    () =>
      videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
    [videoId]
  );

  // YT Player refs
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<number | null>(null);

  /* ——— 초기 로드: id='music' 한 행 읽기 ——— */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("music_singleton")
        .select("url")
        .eq("id", "music")
        .maybeSingle();

      if (!error) {
        setUrl(data?.url ?? null);
      }
      setLoading(false);
    })();
  }, []);

  /* ——— 관리자 전용: 다이얼로그 열기 ——— */
  const onOpen = () => {
    if (!isAdmin) {
      toast("관리자만 수정할 수 있어요.");
      return;
    }
    setDraft(url ?? "");
    setOpen(true);
  };

  /* ——— 저장: 단일 행만 update ——— */
  const onSave = async () => {
    if (!isAdmin) {
      toast("관리자만 수정할 수 있어요.");
      return;
    }
    if (draft.trim() && !draftId) {
      toast("유효한 YouTube 링크(ID)를 입력해 주세요.");
      return;
    }
    // if (rowId == null) {
    //   toast("초기 레코드가 없습니다. 먼저 DB에 1행을 만들어 주세요.");
    //   return;
    // }
    try {
      setSaving(true);
      const next = draft.trim() || null;

      const { error } = await supabase
        .from("music_singleton")
        .update({ url: next })
        .eq("id", "music"); // ← 여기! 단일 행만 갱신

      if (error) throw error;

      setUrl(next);
      setPlayerOpen(false); // 저장 후 썸네일로
      setOpen(false);
      toast(next ? "음악 링크를 저장했어요 🎵" : "음악 링크를 비웠어요.");
    } catch {
      toast("저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  /* ——— 재생 상태 감지 & 종료시 썸네일 복귀 ——— */
  useEffect(() => {
    const destroy = () => {
      if (pollRef.current != null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      setIsAudible(false);
    };

    const updateAudible = () => {
      const YT = getYT();
      const p = playerRef.current;
      if (!YT || !p) return setIsAudible(false);
      const state = p.getPlayerState?.();
      const vol = p.getVolume?.() ?? 100;
      const muted = p.isMuted?.() ?? false;
      const playing = state === YT.PlayerState.PLAYING;
      setIsAudible(Boolean(playing && !muted && vol > 0));
    };

    const setup = async () => {
      if (!playerOpen || !videoId || !playerHostRef.current) {
        destroy();
        return;
      }
      await ensureYouTubeApi();

      destroy();
      const YT = getYT();
      if (!YT) return;

      playerRef.current = new YT.Player(playerHostRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1, playsinline: 1 },
        events: {
          onReady: () => updateAudible(),
          onStateChange: (e: { data: number }) => {
            updateAudible();
            if (e.data === YT.PlayerState.ENDED) setPlayerOpen(false);
          },
        },
      });

      pollRef.current = window.setInterval(updateAudible, 500);
    };

    setup();
    return () => destroy();
  }, [playerOpen, videoId]);

  /* ——— 상태 배지 ——— */
  const StatusBadge = ({ active }: { active: boolean }) => (
    <span
      className={[
        "ml-2 inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2 py-1 text-[11px] font-medium",
        active
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-800",
      ].join(" ")}
    >
      <span className="relative inline-grid place-items-center h-3.5 w-3.5">
        <span
          className={[
            "absolute inset-0 rounded-full border-2 border-t-transparent",
            active
              ? "border-emerald-400/60 animate-[spin_1.2s_linear_infinite]"
              : "border-rose-300/70",
          ].join(" ")}
        />
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-emerald-500" : "bg-rose-500",
          ].join(" ")}
        />
      </span>
      {active ? "재생중" : "일시정지"}
    </span>
  );

  /* ——— 렌더 (UI 동일) ——— */
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[#3d2b1f] font-semibold">
            🎧 뮤직 플레이어
            <StatusBadge active={isAudible} />
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpen}
            className="gap-1 hover:cursor-pointer"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-5xl md:max-w-6xl">
              <div className="relative">
                <div className="relative aspect-video overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 rounded-3xl bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : url && videoId ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-5xl md:max-w-6xl">
              <div className="relative">
                <div
                  className={[
                    "relative aspect-video overflow-hidden rounded-3xl shadow-2xl transition-shadow",
                    isAudible ? "shadow-emerald-200/50" : "",
                  ].join(" ")}
                >
                  {playerOpen ? (
                    <div ref={playerHostRef} className="w-full h-full" />
                  ) : (
                    <button
                      onClick={() => setPlayerOpen(true)}
                      className="relative w-full h-full transition-transform duration-300 hover:scale-[1.02]"
                      title="재생"
                      aria-label="재생"
                      type="button"
                    >
                      {thumb && (
                        <img
                          src={thumb}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">
            등록된 YouTube 링크가 없어요.{" "}
            <span className="font-medium">‘수정’</span> 버튼을 눌러
            설정해보세요.
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (v && !isAdmin) {
            toast("관리자만 수정할 수 있어요.");
            return;
          }
          setOpen(v);
          if (!v) setDraft("");
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>음악 링크 설정</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="YouTube 링크 또는 영상 ID(11자)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              예) <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code> 또는{" "}
              <code>dQw4w9WgXcQ</code>
            </div>

            {draft ? (
              draftId ? (
                <div className="mt-2">
                  <div className="text-xs mb-1 text-[#3d2b1f] font-medium">
                    미리보기
                  </div>
                  <div className="w-full max-w-md aspect-video overflow-hidden rounded-xl border ring-1 ring-black/5 shadow-lg">
                    <iframe
                      key={draftId}
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${draftId}?rel=0&modestbranding=1&playsinline=1`}
                      title="Preview"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-600">
                  올바른 YouTube 링크(ID)를 입력해 주세요.
                </p>
              )
            ) : (
              <p className="text-xs text-muted-foreground">
                비워두면 링크가 제거됩니다.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="gap-1"
              disabled={saving}
            >
              <X className="h-4 w-4" />
              취소
            </Button>
            <Button
              onClick={onSave}
              className="gap-1"
              disabled={saving || !isAdmin}
            >
              <Check className="h-4 w-4" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
