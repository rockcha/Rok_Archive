// src/features/tasks/utils.ts
import { format } from "date-fns";

export const toYMD = (d: Date) => format(d, "yyyy-MM-dd");
export const weekdayKR = (d: Date) => format(d, "EEE");

export const dday = (targetDateYMD: string) => {
  const today = new Date();
  const target = new Date(targetDateYMD + "T00:00:00");
  const diff = Math.floor(
    (target.getTime() -
      new Date(format(today, "yyyy-MM-dd") + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return { label: "D-DAY", value: 0 };
  if (diff > 0) return { label: `D-${diff}`, value: diff };
  return { label: `D+${Math.abs(diff)}`, value: diff };
};

export const cn = (...a: (string | false | undefined)[]) =>
  a.filter(Boolean).join(" ");

export const faviconUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${raw}&sz=32`;
  }
};
