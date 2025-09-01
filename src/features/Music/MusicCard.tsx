// src/features/music/MusicCard.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { getYT, getYTReadyCb, setYTReadyCb, type YTPlayer } from "./yt-helpers";
import { useAdmin } from "../Auth/useAdmin";

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

type PlaylistRow = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

export default function MusicCard() {
  const [loading, setLoading] = useState(true);

  // ▶ 재생목록 + 선택 항목
  const [playlist, setPlaylist] = useState<PlaylistRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ▶ 추가 모달
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [adding, setAdding] = useState(false);

  // 플레이 상태 (썸네일 ↔ 플레이어)
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isAudible, setIsAudible] = useState(false);

  // 현재 선택된 행/URL/ID/썸네일
  const selected = useMemo(
    () => playlist.find((p) => p.id === selectedId) || null,
    [playlist, selectedId]
  );
  const url = selected?.url ?? null;
  const videoId = useMemo(() => (url ? extractYouTubeId(url) : null), [url]);
  const thumb = useMemo(
    () =>
      videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
    [videoId]
  );

  // YT Player refs
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<number | null>(null);

  const { isAdmin } = useAdmin();

  /* ——— 초기 로드: 재생목록 불러와 첫 곡 선택 ——— */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("music_playlist")
          .select("id,title,url,created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPlaylist(data ?? []);
        setSelectedId((data ?? [])[0]?.id ?? null);
      } catch {
        toast("재생목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  /* ——— 곡 추가 핸들러 ——— */
  const onAddSong = async () => {
    const t = addTitle.trim();
    const u = addUrl.trim();
    if (!t) {
      toast("제목을 입력해 주세요.");
      return;
    }
    const id = extractYouTubeId(u);
    if (!id) {
      toast("유효한 YouTube 링크 또는 영상 ID를 입력해 주세요.");
      return;
    }

    try {
      setAdding(true);
      // 원본 URL을 그대로 저장(정규화하고 싶으면 https://www.youtube.com/watch?v=${id} 로 저장해도 됨)
      const { data, error } = await supabase
        .from("music_playlist")
        .insert([{ title: t, url: u }])
        .select()
        .single();

      if (error) throw error;

      // 리스트에 즉시 반영(최상단에 추가)
      setPlaylist((prev) => [data as PlaylistRow, ...prev]);
      setSelectedId((data as PlaylistRow).id);
      setPlayerOpen(false);
      setAddOpen(false);
      setAddTitle("");
      setAddUrl("");
      toast("재생목록에 곡을 추가했어요 🎵");
    } catch {
      toast("곡을 추가하지 못했어요.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border shadow-sm">
      {/* ← w-full 추가 */}
      <div className="px-4 pt-5">
        <div className="flex flex-col gap-3">
          {/* 헤더: 제목 말줄임 + 상태 배지 */}
          <div className="flex items-center gap-2">
            <span className="flex-1 min-w-0 truncate text-[#3d2b1f] font-semibold">
              🎧 뮤직 플레이어
            </span>
            <StatusBadge active={isAudible} />
          </div>

          {/* 제목 선택 + 추가 버튼 */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <select
                aria-label="곡 선택"
                className="w-full h-9 rounded-md border px-2 text-sm bg-background"
                disabled={loading || playlist.length === 0}
                value={selectedId ?? ""}
                onChange={(e) => {
                  setPlayerOpen(false);
                  setSelectedId(e.target.value || null);
                }}
              >
                {playlist.length === 0 ? (
                  <option value="">(재생목록 없음)</option>
                ) : (
                  playlist.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={!isAdmin}
              onClick={() => setAddOpen(true)}
              className="hover:cursor-pointer"
            >
              + 곡 추가
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        {loading ? (
          <div className="w-full">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <div className="absolute inset-0 rounded-3xl bg-muted animate-pulse" />
            </div>
          </div>
        ) : url && videoId ? (
          <div className="w-full">
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
                      alt={selected?.title ?? "thumbnail"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground text-center">
            재생할 곡이 없어요. 우측 상단의{" "}
            <span className="font-medium">‘+ 추가’</span>로 곡을 넣어보세요.
          </div>
        )}
      </div>

      {/* 곡 추가 모달 (그대로) */}
      <Dialog
        open={addOpen}
        onOpenChange={(v) => {
          setAddOpen(v);
          if (!v) {
            setAddTitle("");
            setAddUrl("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>곡 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="제목"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
            />
            <Input
              placeholder="YouTube 링크 또는 영상 ID(11자)"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              예) <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code> 또는{" "}
              <code>dQw4w9WgXcQ</code>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={adding}
            >
              취소
            </Button>
            <Button onClick={onAddSong} disabled={adding}>
              {adding ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
