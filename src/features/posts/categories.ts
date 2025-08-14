// src/features/posts/categories.ts
// 1) 카테고리 종류(소문자 입력 기준)
export const CATEGORIES = [
  "react",
  "javascript",
  "typescript",
  "python",
  "cs-basic",
] as const;

export type Category = (typeof CATEGORIES)[number];

// 2) 표시용 라벨
export const CATEGORY_LABEL: Record<Category, string> = {
  react: "React",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  "cs-basic": "CS Basic",
};

// 안전 라벨 함수: 등록되어 있지 않으면 대문자로 폴백
export function categoryLabel(input: string): string {
  const key = input.trim().toLowerCase();
  return (CATEGORIES as readonly string[]).includes(key)
    ? CATEGORY_LABEL[key as Category]
    : key.toUpperCase();
}

// 3) 뱃지 색상 클래스 (라이트/다크 포함)
export const CATEGORY_BADGE_CLASS: Record<Category, string> = {
  react: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  javascript:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  typescript:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  python:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "cs-basic":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

// 4) 안전 클래스 헬퍼: 미등록 값이면 중립색
export function categoryBadgeClass(input: string): string {
  const key = input.trim().toLowerCase() as Category;
  return (
    CATEGORY_BADGE_CLASS[key] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
  );
}
