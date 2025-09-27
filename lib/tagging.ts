import { ALL_TAG_KEYS, TAGS, TagKey } from "./tags";

const CODE_RE = /:([a-z0-9-]+):/g;

export function extractTags(note?: string): { tags: TagKey[]; text: string } {
  if (!note) return { tags: [], text: "" };
  const found = new Set<TagKey>();
  let m: RegExpExecArray | null;
  while ((m = CODE_RE.exec(note))) {
    const k = m[1] as TagKey;
    if ((ALL_TAG_KEYS as readonly string[]).includes(k)) found.add(k);
  }
  // καθάρισε τους κωδικούς από το text
  const text = note.replace(CODE_RE, "").replace(/\s+/g, " ").trim();
  return { tags: Array.from(found), text };
}

export function mergeTagsIntoNote(text: string, tags: TagKey[]): string {
  const codes = tags.map((t) => `:${t}:`).join(" ");
  return (codes + (text ? " " + text : "")).trim();
}

export { TAGS };
export type { TagKey };
