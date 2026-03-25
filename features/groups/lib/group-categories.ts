import type { DashboardGroupPreview } from "@/features/dashboard/types";
import type { Group, GroupContact } from "@/features/groups/types";

export type GroupCategorySlug = "viagem" | "casa" | "refeicao" | "outro";

type GroupCategoryOption = {
  slug: GroupCategorySlug;
  label: string;
  tone: Group["tone"];
  dashboardIcon: DashboardGroupPreview["icon"];
};

export const groupCategoryOptions: GroupCategoryOption[] = [
  {
    slug: "viagem",
    label: "Viagem",
    tone: "indigo",
    dashboardIcon: "plane",
  },
  {
    slug: "casa",
    label: "Casa",
    tone: "green",
    dashboardIcon: "house",
  },
  {
    slug: "refeicao",
    label: "Refeição",
    tone: "amber",
    dashboardIcon: "sparkles",
  },
  {
    slug: "outro",
    label: "Outro",
    tone: "rose",
    dashboardIcon: "sparkles",
  },
];

function normalizeValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getGroupCategoryLabel(slug: string) {
  return (
    groupCategoryOptions.find((option) => option.slug === slug)?.label ??
    "Outro"
  );
}

export function getGroupCategorySlug(input: string): GroupCategorySlug | null {
  const normalizedInput = normalizeValue(input);

  return (
    groupCategoryOptions.find(
      (option) =>
        option.slug === normalizedInput ||
        normalizeValue(option.label) === normalizedInput,
    )?.slug ?? null
  );
}

export function getGroupTone(categorySlug: string): Group["tone"] {
  return (
    groupCategoryOptions.find((option) => option.slug === categorySlug)?.tone ??
    "rose"
  );
}

export function getDashboardGroupIcon(
  categorySlug: string,
): DashboardGroupPreview["icon"] {
  return (
    groupCategoryOptions.find((option) => option.slug === categorySlug)
      ?.dashboardIcon ?? "sparkles"
  );
}

export function getGroupCategoryLabels() {
  return groupCategoryOptions.map((option) => option.label);
}

export function getContactTone(index: number): GroupContact["tone"] {
  const tones: GroupContact["tone"][] = ["amber", "green", "indigo", "rose"];

  return tones[index % tones.length];
}
