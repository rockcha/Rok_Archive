// src/pages/weather79.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

/** ========= Types ========= */
type Current = {
  temperature: number; // °C
  windspeed: number; // km/h
  winddirection: number; // °
  weathercode: number; // WMO
  is_day: 0 | 1;
  time: string;
};

type Hourly = {
  time: string[];
  temperature_2m: number[];
};

/** Open-Meteo 응답은 버전에 따라 두 가지 포맷이 올 수 있으므로 느슨하게 정의 */
type WeatherRespLoose = {
  latitude?: number;
  longitude?: number;
  timezone?: string;

  // 최신 포맷 (current=...)
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    weather_code?: number;
    is_day?: 0 | 1;
    time?: string;
  };

  // 예전 포맷 (current_weather=true)
  current_weather?: {
    temperature?: number;
    windspeed?: number;
    winddirection?: number;
    weathercode?: number;
    is_day?: 0 | 1;
    time?: string;
  };

  hourly?: Hourly;
};

type GeoResp = {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }>;
};

/** ========= Constants ========= */
const PRESET_CITIES = [
  { key: "seoul", label: "Seoul", q: "Seoul" },
  { key: "tokyo", label: "Tokyo", q: "Tokyo" },
  { key: "newyork", label: "New York", q: "New York" },
  { key: "london", label: "London", q: "London" },
  { key: "paris", label: "Paris", q: "Paris" },
];

const DEFAULT_COORD = { lat: 37.5665, lon: 126.978, label: "서울(기본값)" };

/** ========= Utils ========= */
const cToF = (c: number) => Math.round((c * 9) / 5 + 32);
const degToCompass = (deg: number) => {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
};

const wmoToDesc: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "맑음" },
  1: { emoji: "🌤️", label: "대체로 맑음" },
  2: { emoji: "⛅", label: "부분 흐림" },
  3: { emoji: "☁️", label: "흐림" },
  45: { emoji: "🌫️", label: "안개" },
  48: { emoji: "🌫️", label: "서리 안개" },
  51: { emoji: "🌦️", label: "이슬비(약)" },
  53: { emoji: "🌦️", label: "이슬비" },
  55: { emoji: "🌧️", label: "이슬비(강)" },
  61: { emoji: "🌦️", label: "비(약)" },
  63: { emoji: "🌧️", label: "비" },
  65: { emoji: "🌧️", label: "비(강)" },
  66: { emoji: "🌧️❄️", label: "어는 비" },
  67: { emoji: "🌧️❄️", label: "어는 비(강)" },
  71: { emoji: "❄️", label: "눈(약)" },
  73: { emoji: "❄️", label: "눈" },
  75: { emoji: "🌨️", label: "눈(강)" },
  77: { emoji: "🌨️", label: "싸락눈" },
  80: { emoji: "🌦️", label: "소나기" },
  81: { emoji: "🌧️", label: "소나기(강)" },
  82: { emoji: "⛈️", label: "강한 비" },
  85: { emoji: "🌨️", label: "눈 소나기" },
  86: { emoji: "🌨️", label: "눈 소나기(강)" },
  95: { emoji: "⛈️", label: "뇌우" },
  96: { emoji: "⛈️🌩️", label: "우박 동반 뇌우" },
  99: { emoji: "⛈️🌩️", label: "강한 우박 뇌우" },
};

const getWmo = (code?: number) =>
  wmoToDesc[code ?? -1] ?? { emoji: "❔", label: "알 수 없음" };

/** ========= Spinner ========= */
const Spinner: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 22,
}) => (
  <div
    className={cn(
      "inline-block animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground",
      className
    )}
    style={{ width: size, height: size }}
    aria-label="로딩 중"
    role="status"
  />
);

/** ========= Normalize ========= */
function normalizeCurrent(data: WeatherRespLoose): Current | null {
  // 1) 최신 current 포맷
  const c = data.current;
  if (
    c &&
    typeof c.temperature_2m === "number" &&
    typeof c.wind_speed_10m === "number"
  ) {
    return {
      temperature: c.temperature_2m,
      windspeed: c.wind_speed_10m,
      winddirection: Number(c.wind_direction_10m ?? 0),
      weathercode: Number(c.weather_code ?? -1),
      is_day: (c.is_day ?? 1) as 0 | 1,
      time: c.time ?? "",
    };
  }
  // 2) 예전 current_weather 포맷
  const cw = data.current_weather;
  if (
    cw &&
    typeof cw.temperature === "number" &&
    typeof cw.windspeed === "number"
  ) {
    return {
      temperature: cw.temperature,
      windspeed: cw.windspeed,
      winddirection: Number(cw.winddirection ?? 0),
      weathercode: Number(cw.weathercode ?? -1),
      is_day: (cw.is_day ?? 1) as 0 | 1,
      time: cw.time ?? "",
    };
  }
  return null;
}

/** ========= Main Component ========= */
const Weather79: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"current" | "city">("current");
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("현재 위치");
  const [meta, setMeta] = useState<{
    lat: number;
    lon: number;
    tz?: string;
  } | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [hourly, setHourly] = useState<Hourly | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDay = current?.is_day === 1;

  const gradient = useMemo(
    () =>
      isDay
        ? "bg-gradient-to-br from-sky-200 via-sky-100 to-emerald-100 dark:from-sky-900/40 dark:via-sky-900/20 dark:to-emerald-900/30"
        : "bg-gradient-to-br from-indigo-200 via-violet-100 to-fuchsia-100 dark:from-indigo-900/40 dark:via-violet-900/20 dark:to-fuchsia-900/30",
    [isDay]
  );

  /** ---- core fetchers ---- */
  const fetchWeather = async (lat: number, lon: number, label?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lon));
      url.searchParams.set(
        "current",
        "temperature_2m,wind_direction_10m,wind_speed_10m,weather_code,is_day"
      );
      // 구형 호환
      url.searchParams.set("current_weather", "true");
      url.searchParams.set("hourly", "temperature_2m");
      url.searchParams.set("forecast_days", "1");
      url.searchParams.set("timezone", "auto");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("날씨 정보를 불러오지 못했습니다");
      const data = (await res.json()) as WeatherRespLoose;

      const cur = normalizeCurrent(data);
      if (
        !cur ||
        Number.isNaN(cur.temperature) ||
        Number.isNaN(cur.windspeed)
      ) {
        throw new Error("잘못된 날씨 데이터입니다");
      }

      setMeta({
        lat: Number(data.latitude ?? lat),
        lon: Number(data.longitude ?? lon),
        tz: data.timezone,
      });
      setCurrent(cur);

      setHourly(
        data.hourly &&
          Array.isArray(data.hourly.temperature_2m) &&
          data.hourly.temperature_2m.length
          ? {
              time: data.hourly.time,
              temperature_2m: data.hourly.temperature_2m,
            }
          : null
      );

      if (label) setTitle(label);
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const geocodeAndFetch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = new URL("https://geocoding-api.open-meteo.com/v1/search");
      u.searchParams.set("name", q);
      u.searchParams.set("count", "1");
      const res = await fetch(u.toString());
      if (!res.ok) throw new Error("도시 정보를 찾지 못했습니다");
      const geo = (await res.json()) as GeoResp;
      const best = geo.results?.[0];
      if (!best) throw new Error("해당 도시가 없습니다");
      const label = [best.name, best.admin1, best.country]
        .filter(Boolean)
        .join(", ");
      await fetchWeather(best.latitude, best.longitude, label);
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  /** ---- on mount: current location ---- */
  useEffect(() => {
    setTitle("현재 위치");
    setMode("current");
    setActiveCity(null);

    if (!navigator.geolocation) {
      fetchWeather(DEFAULT_COORD.lat, DEFAULT_COORD.lon, DEFAULT_COORD.label);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords?.latitude);
        const lon = Number(pos.coords?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          fetchWeather(lat, lon, "현재 위치");
        } else {
          fetchWeather(
            DEFAULT_COORD.lat,
            DEFAULT_COORD.lon,
            DEFAULT_COORD.label
          );
        }
      },
      () => {
        fetchWeather(DEFAULT_COORD.lat, DEFAULT_COORD.lon, DEFAULT_COORD.label);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ---- handlers ---- */
  const handleCityClick = async (cityKey: string, q: string) => {
    setMode("city");
    setActiveCity(cityKey);
    await geocodeAndFetch(q);
  };

  const handleCurrentClick = async () => {
    setMode("current");
    setActiveCity(null);
    setTitle("현재 위치");
    if (!navigator.geolocation)
      return fetchWeather(
        DEFAULT_COORD.lat,
        DEFAULT_COORD.lon,
        DEFAULT_COORD.label
      );
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "현재 위치"),
      () =>
        fetchWeather(DEFAULT_COORD.lat, DEFAULT_COORD.lon, DEFAULT_COORD.label),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /** ---- derived ---- */
  const wmo = getWmo(current?.weathercode);
  const tempC = current?.temperature ?? null;
  const tempF = tempC != null ? cToF(tempC) : null;

  return (
    <div
      className={cn(
        "min-h-[100dvh] w-full grid place-items-center",
        "px-4 py-8",
        gradient,
        "transition-colors duration-500"
      )}
    >
      {/* 중앙 카드 */}
      <Card className="w-full max-w-3xl border-foreground/10 bg-background/70 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            날씨 앱
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "current" ? "현재 위치 기준" : "도시 선택"} ·{" "}
            <span className="font-medium">{title}</span>
          </p>
        </CardHeader>

        <CardContent className="overflow-hidden">
          {/* 도시 버튼 */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={activeCity === null ? "default" : "secondary"}
              onClick={handleCurrentClick}
              className={cn(
                "rounded-full",
                activeCity === null &&
                  "ring-2 ring-offset-2 ring-offset-background ring-foreground/40"
              )}
            >
              📍 현재 위치
            </Button>
            {PRESET_CITIES.map((c) => (
              <Button
                key={c.key}
                variant={activeCity === c.key ? "default" : "outline"}
                onClick={() => handleCityClick(c.key, c.q)}
                className={cn(
                  "rounded-full",
                  activeCity === c.key &&
                    "ring-2 ring-offset-2 ring-offset-background ring-foreground/40"
                )}
              >
                {activeCity === c.key ? "⭐ " : ""}
                {c.label}
              </Button>
            ))}
          </div>

          {/* 현재 요약 */}
          <div className="mt-6 grid gap-6">
            <Card className="border-foreground/10 bg-background/60 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-3">
                  {loading && <Spinner />}
                  <span>지금</span>
                  {current?.is_day === 1 ? (
                    <Badge variant="secondary" className="rounded-full">
                      낮
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full">
                      밤
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div
                    className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive"
                    role="alert"
                  >
                    🚫 {error}
                  </div>
                )}

                {!error && (
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="text-6xl font-extrabold leading-none">
                      {tempC != null ? `${Math.round(tempC)}°C` : "--"}
                    </div>
                    <div className="text-muted-foreground">
                      ({tempF != null ? `${tempF}°F` : "--"})
                    </div>

                    <div className="mt-1 text-xl">
                      <span className="mr-2">{wmo.emoji}</span>
                      <span className="font-medium">{wmo.label}</span>
                    </div>

                    <div className="mt-3 grid w-full max-w-md grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border bg-background/60 p-3">
                        <div className="text-muted-foreground">바람</div>
                        <div className="font-medium">
                          {current
                            ? `${Math.round(current.windspeed)} km/h`
                            : "--"}
                        </div>
                      </div>
                      <div className="rounded-lg border bg-background/60 p-3">
                        <div className="text-muted-foreground">풍향</div>
                        <div className="font-medium">
                          {current
                            ? `${degToCompass(
                                current.winddirection
                              )} (${Math.round(current.winddirection)}°)`
                            : "--"}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {meta?.tz ? `시간대: ${meta.tz}` : ""}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 시간별 24시간: 가로 스크롤(부모 고정폭) */}
            <Card className="border-foreground/10 bg-background/60 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-3">
                  {loading ? <Spinner /> : <span>다음 24시간</span>}
                  <Badge variant="outline" className="rounded-full">
                    시간별
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-hidden">
                {/* 부모를 절대 넘지 않게 -mx-2로 여백만 확장, 실제 너비는 w-full */}
                <div
                  className={cn(
                    "-mx-2 px-2 w-full",
                    "no-scrollbar overflow-x-auto overscroll-x-contain",
                    "snap-x snap-mandatory"
                  )}
                  role="region"
                  aria-label="시간별 기온 가로 스크롤"
                >
                  <div className="flex gap-2 w-max py-1">
                    {(hourly?.time ?? []).slice(0, 24).map((t, i) => {
                      const c = hourly?.temperature_2m?.[i];
                      const f = typeof c === "number" ? cToF(c) : null;
                      const d = new Date(t);
                      const hour = Number.isFinite(d.getTime())
                        ? d.getHours().toString().padStart(2, "0")
                        : "--";
                      const valid = typeof c === "number" && !Number.isNaN(c);
                      return (
                        <div
                          key={`${t}-${i}`}
                          className={cn(
                            "flex flex-col items-center justify-end",
                            "rounded-xl border p-3 bg-background/60",
                            "flex-none w-20 snap-start"
                          )}
                        >
                          <div className="text-xs text-muted-foreground">
                            {hour}:00
                          </div>
                          <div className="mt-2 text-lg font-semibold">
                            {valid ? `${Math.round(c!)}°C` : "--"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {f != null ? `${f}°F` : "--"}
                          </div>
                        </div>
                      );
                    })}
                    {!hourly?.time?.length && !loading && (
                      <div className="mx-auto text-sm text-muted-foreground">
                        시간별 데이터가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather79;
