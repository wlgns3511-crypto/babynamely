import nameKeepList from "@/lib/generated/name-keep.json";

const INDEXABLE_NAME_SLUGS = new Set(nameKeepList as string[]);

export function isIndexableNameSlug(slug: string): boolean {
  return INDEXABLE_NAME_SLUGS.has(slug);
}
