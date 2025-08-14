// src/shared/utils/parseTags.ts
function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export { parseTags }; // named export
export default parseTags; // default export (선택)
