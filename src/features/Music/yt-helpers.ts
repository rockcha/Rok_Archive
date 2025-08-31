// 전역 선언 없이 window를 "좁게" 캐스팅해서 접근하는 유틸

export type YTPlayer = {
  destroy(): void;
  getPlayerState(): number;
  getVolume(): number;
  isMuted(): boolean;
};

export type YTNS = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (e: { target: unknown }) => void;
        onStateChange?: (e: { data: number; target: unknown }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
};

// YT 네임스페이스 안전 접근
export function getYT(): YTNS | undefined {
  return (window as unknown as { YT?: YTNS }).YT;
}

// onYouTubeIframeAPIReady 안전 접근/설정
export function getYTReadyCb(): (() => void) | undefined {
  return (window as unknown as { onYouTubeIframeAPIReady?: () => void })
    .onYouTubeIframeAPIReady;
}
export function setYTReadyCb(fn: () => void) {
  (
    window as unknown as { onYouTubeIframeAPIReady?: () => void }
  ).onYouTubeIframeAPIReady = fn;
}
