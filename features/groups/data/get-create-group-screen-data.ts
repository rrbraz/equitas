import "server-only";

import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";
import { getGroupCategoryLabels } from "@/features/groups/lib/group-categories";

export async function getCreateGroupScreenData() {
  const viewer = await getCurrentViewer();

  return {
    viewer,
    categories: getGroupCategoryLabels(),
    selectedMembers: [],
    frequentConnections: [],
  };
}
