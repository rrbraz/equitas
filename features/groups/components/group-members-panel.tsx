"use client";

import { Copy, Link2, Mail, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { createGroupInvite } from "@/features/groups/actions/create-group-invite";
import { removeGroupMember } from "@/features/groups/actions/remove-group-member";
import type { GroupBalance, GroupInviteSummary } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";

type GroupMembersPanelProps = {
  groupId: string;
  groupSlug: string;
  members: GroupBalance[];
  invites: GroupInviteSummary[];
  canManageInvites: boolean;
  canRemoveMembers: boolean;
};

function formatInviteDate(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(dateString));
}

export function GroupMembersPanel({
  groupId,
  groupSlug,
  members,
  invites,
  canManageInvites,
  canRemoveMembers,
}: GroupMembersPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function copyInviteLink(inviteHref: string) {
    const absoluteUrl = `${window.location.origin}${inviteHref}`;

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback({
        tone: "success",
        title: "Link copiado",
        message: "O link interno do convite já pode ser compartilhado.",
      });
    } catch {
      setFeedback({
        tone: "info",
        title: "Copie o link manualmente",
        message: absoluteUrl,
      });
    }
  }

  function handleCreateInvite(mode: "email" | "link") {
    startTransition(async () => {
      const result = await createGroupInvite({
        groupId,
        groupSlug,
        mode,
        invitedEmail: mode === "email" ? email : undefined,
      });

      if (!result.ok) {
        setFeedback({
          tone: "error",
          title: "Convite não criado",
          message: result.message,
        });
        return;
      }

      if (mode === "email") {
        setEmail("");
      }

      setFeedback({
        tone: "success",
        title: "Convite criado",
        message: result.message,
      });
      router.refresh();

      if (mode === "link" && result.token) {
        await copyInviteLink(`/convites/${result.token}`);
      }
    });
  }

  function handleRemoveMember(profileId: string) {
    startTransition(async () => {
      const result = await removeGroupMember({
        groupId,
        groupSlug,
        memberProfileId: profileId,
      });

      setFeedback({
        tone: result.ok ? "success" : "error",
        title: result.ok ? "Membro removido" : "Não foi possível remover",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <>
      {feedback ? (
        <ActionFeedback
          tone={feedback.tone}
          title={feedback.title}
          message={feedback.message}
        />
      ) : null}

      <section className="surface-section section-stack">
        <div className="section-heading">
          <div>
            <h2>Saldos por membro</h2>
            <p className="supporting-copy">
              Leitura atual do grupo, com saldo e papel de cada pessoa.
            </p>
          </div>
          <span className="section-label">Momento atual</span>
        </div>
        <div className="list-stack">
          {members.map((member) => (
            <article
              key={member.profileId ?? member.member}
              className="list-card"
            >
              <Avatar
                name={member.member}
                initials={member.initials}
                tone={member.tone}
                size="sm"
              />
              <div className="list-card__copy">
                <div className="list-card__title">{member.member}</div>
                <p className="list-card__meta">{member.role}</p>
              </div>
              <div className="list-card__value">
                <span>
                  {member.balance > 0
                    ? "A receber"
                    : member.balance < 0
                      ? "A pagar"
                      : "Sem saldo"}
                </span>
                <strong
                  className={
                    member.balance >= 0 ? "money-positive" : "money-negative"
                  }
                >
                  {formatCurrency(Math.abs(member.balance))}
                </strong>
                {canRemoveMembers && member.canRemove && member.profileId ? (
                  <button
                    type="button"
                    className="ghost-link ghost-link--compact"
                    disabled={isPending}
                    onClick={() => handleRemoveMember(member.profileId!)}
                  >
                    <UserMinus size={14} />
                    Remover
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {canManageInvites ? (
        <section className="surface-section section-stack">
          <div className="section-heading">
            <div>
              <h2>Convites pendentes</h2>
              <p className="supporting-copy">
                Convide por e-mail ou gere um link interno para entrada rápida.
              </p>
            </div>
            <span className="section-label">{invites.length} ativos</span>
          </div>

          <section className="surface-card stack-column">
            <span className="field-label">Novo convite</span>
            <label className="input-shell">
              <span className="input-shell__icon">
                <Mail size={18} />
              </span>
              <input
                placeholder="email@exemplo.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFeedback(null);
                }}
              />
            </label>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                disabled={isPending}
                onClick={() => handleCreateInvite("email")}
              >
                <UserPlus size={18} />
                Convidar por email
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={isPending}
                onClick={() => handleCreateInvite("link")}
              >
                <Link2 size={18} />
                Gerar link interno
              </button>
            </div>
          </section>

          {invites.length > 0 ? (
            <div className="list-stack">
              {invites.map((invite) => (
                <article key={invite.id} className="list-card">
                  <div className="inline-card__avatar inline-card__avatar--soft">
                    {invite.invitedEmail ? (
                      <Mail size={18} />
                    ) : (
                      <Link2 size={18} />
                    )}
                  </div>
                  <div className="list-card__copy">
                    <div className="list-card__title">
                      {invite.invitedEmail ?? "Link interno sem email"}
                    </div>
                    <p className="list-card__meta">
                      Papel {invite.role} · criado em{" "}
                      {formatInviteDate(invite.createdAt)}
                    </p>
                  </div>
                  <div className="list-card__value">
                    <button
                      type="button"
                      className="ghost-link ghost-link--compact"
                      onClick={() => copyInviteLink(invite.inviteHref)}
                    >
                      <Copy size={14} />
                      Copiar link
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Sem convites pendentes"
              title="Nenhum convite aberto neste grupo"
              description="Use e-mail ou link interno para trazer novos membros para o grupo."
            />
          )}
        </section>
      ) : null}
    </>
  );
}
