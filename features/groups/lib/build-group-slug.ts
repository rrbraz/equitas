export function buildGroupSlug(name: string, attempt = 0) {
  const baseSlug =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "grupo";

  if (attempt <= 0) {
    return baseSlug;
  }

  return `${baseSlug}-${attempt + 1}`;
}
