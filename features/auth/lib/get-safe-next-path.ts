export function getSafeNextPath(
  candidate?: string | null,
  fallback = "/dashboard",
) {
  if (!candidate || !candidate.startsWith("/")) {
    return fallback;
  }

  return candidate;
}
