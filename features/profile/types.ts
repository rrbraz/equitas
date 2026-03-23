export type ProfilePreference = {
  icon: "account" | "notifications" | "payments" | "security";
  title: string;
  description: string;
};

export type ProfileSummaryTotals = {
  owedToYou: number;
  youOwe: number;
};

export type ProfileScreenData = {
  viewer: {
    id: string;
    name: string;
    initials: string;
    role: string;
    city: string;
    since: string;
    memberSinceLabel: string;
  };
  totals: ProfileSummaryTotals;
  preferences: ProfilePreference[];
};
