import type {
  ProfileScreenData,
  ProfileSummaryTotals,
} from "@/features/profile/types";
import { profilePreferences } from "@/features/profile/lib/profile-preferences";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

export const mockProfileSummaryTotals: ProfileSummaryTotals = {
  owedToYou: 2140,
  youOwe: 657.5,
};

type ProfileScenario = "default" | "new";

export function getMockProfileScreenData(
  scenario: ProfileScenario = "default",
): ProfileScreenData {
  return {
    viewer: mockCurrentViewer,
    totals:
      scenario === "new"
        ? { owedToYou: 0, youOwe: 0 }
        : mockProfileSummaryTotals,
    preferences: profilePreferences,
    scenario,
  };
}
