import type { Group } from "@/features/groups/types";

export function getGroupsTotalBalance(groups: Group[]) {
  return groups.reduce((sum, group) => sum + group.balance, 0);
}
