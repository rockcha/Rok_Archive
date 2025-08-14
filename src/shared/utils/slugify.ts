// src/shared/utils/slugify.ts
export function slugify(title: string) {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "post";
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${stamp}-${base}`;
}
