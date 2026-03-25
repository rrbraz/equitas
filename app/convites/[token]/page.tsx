import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AcceptInviteCard } from "@/features/groups/components/accept-invite-card";
import { TopBar } from "@/components/top-bar";

export const dynamic = "force-dynamic";

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="screen-shell">
      <TopBar
        title="Convite"
        leading={
          <Link href="/grupos" className="icon-button" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      <main className="page-content">
        <AcceptInviteCard token={token} />
      </main>
    </div>
  );
}
