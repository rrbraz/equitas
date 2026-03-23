import { getMockGroupBySlug } from "@/features/groups/data/mock-groups";

export function getMockExpenseComposerData(groupSlug: string) {
  const group = getMockGroupBySlug(groupSlug);

  if (!group) {
    return null;
  }

  return {
    group,
  };
}
