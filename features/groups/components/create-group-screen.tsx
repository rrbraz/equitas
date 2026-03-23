"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import type { GroupContact } from "@/features/groups/types";
import type { Viewer } from "@/features/viewer/types";

type CreateGroupScreenProps = {
  viewer: Viewer;
  categories: string[];
  selectedMembers: GroupContact[];
  frequentConnections: GroupContact[];
  actionErrorMessage?: string;
};

export function CreateGroupScreen({
  viewer,
  categories,
  selectedMembers,
  frequentConnections,
  actionErrorMessage,
}: CreateGroupScreenProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("Roadtrip de Verao");
  const [activeCategory, setActiveCategory] = useState(
    categories[0] ?? "Outro",
  );
  const [memberQuery, setMemberQuery] = useState("");
  const [selectedMembersState, setSelectedMembersState] =
    useState(selectedMembers);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;
  const suggestedInvite =
    memberQuery.includes("@") &&
    !selectedMembersState.some(
      (member) => member.name === memberQuery.trim(),
    ) &&
    !frequentConnections.some((contact) => contact.name === memberQuery.trim())
      ? memberQuery.trim()
      : "";
  const filteredConnections = useMemo(
    () =>
      frequentConnections.filter((contact) => {
        if (
          selectedMembersState.some((member) => member.name === contact.name)
        ) {
          return false;
        }

        if (!memberQuery.trim()) {
          return true;
        }

        return contact.name.toLowerCase().includes(memberQuery.toLowerCase());
      }),
    [frequentConnections, memberQuery, selectedMembersState],
  );

  function handleSubmit() {
    if (!groupName.trim()) {
      setSubmitErrorMessage(
        "Defina um nome claro para o grupo antes de criar.",
      );
      return;
    }

    if (selectedMembersState.length === 0) {
      setSubmitErrorMessage(
        "Adicione pelo menos um participante para iniciar o grupo.",
      );
      return;
    }

    const slug = groupName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const params = new URLSearchParams({
      created: "1",
      name: groupName.trim(),
      category: activeCategory,
      members: selectedMembersState.map((member) => member.name).join("|"),
    });

    setSubmitErrorMessage(null);
    startTransition(() => {
      router.push(`/grupos/${slug || "novo-grupo"}?${params.toString()}`);
    });
  }

  function handleAddMember(member: GroupContact) {
    setSelectedMembersState((current) => [...current, member]);
    setSubmitErrorMessage(null);
    setMemberQuery("");
  }

  function handleRemoveMember(memberName: string) {
    setSelectedMembersState((current) =>
      current.filter((member) => member.name !== memberName),
    );
    setSubmitErrorMessage(null);
  }

  function handleInviteByEmail(email: string) {
    const normalizedEmail = email.trim();

    if (!normalizedEmail.includes("@")) {
      return;
    }

    handleAddMember({
      name: normalizedEmail,
      initials: normalizedEmail.slice(0, 2).toUpperCase(),
      tone: "rose",
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title="Criar grupo"
        leading={
          <Link href="/grupos" className="icon-button" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <Avatar
            name={viewer.name}
            initials={viewer.initials}
            tone="amber"
            size="sm"
          />
        }
      />

      <main className="page-content">
        {feedbackMessage ? (
          <ActionFeedback
            title="Não foi possível criar o grupo"
            message={feedbackMessage}
          />
        ) : null}

        <section className="hero-copy">
          <span className="eyebrow-note">Novo grupo</span>
          <h1>Crie um grupo pronto para dividir gastos.</h1>
          <p>
            Defina nome, categoria e adicione os membros frequentes em um fluxo
            enxuto.
          </p>
        </section>

        <section className="surface-card stack-column">
          <label>
            <span className="field-label">Nome do grupo</span>
            <input
              className="input-plain"
              value={groupName}
              onChange={(event) => {
                setGroupName(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
          <div>
            <span className="field-label">Categoria</span>
            <div className="pill-row">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`split-pill ${
                    category === activeCategory ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(category);
                    setSubmitErrorMessage(null);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Adicionar participantes</h2>
            <span className="stat-chip stat-chip--positive">
              {selectedMembersState.length} adicionados
            </span>
          </div>

          <label className="input-shell">
            <span className="input-shell__icon">
              <Search size={18} />
            </span>
            <input
              placeholder="Buscar contato ou digitar email para convidar"
              value={memberQuery}
              onChange={(event) => {
                setMemberQuery(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>

          <div className="member-pills">
            {selectedMembersState.map((member) => (
              <button
                key={member.name}
                type="button"
                className="member-chip split-pill"
                onClick={() => handleRemoveMember(member.name)}
              >
                <Avatar
                  name={member.name}
                  initials={member.initials}
                  tone={member.tone}
                  size="sm"
                />
                {member.name}
                <X size={14} />
              </button>
            ))}
          </div>

          {suggestedInvite ? (
            <button
              type="button"
              className="quick-card quick-card--invite"
              onClick={() => handleInviteByEmail(suggestedInvite)}
            >
              <strong>Convidar {suggestedInvite}</strong>
              <p className="list-card__meta">
                Adicionar participante por email
              </p>
            </button>
          ) : null}
        </section>

        <section className="report-card stack-column">
          <div className="section-heading">
            <h2>Contatos frequentes</h2>
            <Sparkles size={18} color="var(--primary-bright)" />
          </div>
          <div className="quick-grid">
            {filteredConnections.map((contact) => (
              <button
                key={contact.name}
                type="button"
                className="quick-card"
                onClick={() => handleAddMember(contact)}
              >
                <Avatar
                  name={contact.name}
                  initials={contact.initials}
                  tone={contact.tone}
                  size="md"
                />
                <strong>{contact.name}</strong>
                <p className="list-card__meta">Adicionar rápido</p>
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="primary-button primary-button--full"
          onClick={handleSubmit}
          disabled={isPending}
        >
          <UserPlus size={18} />
          {isPending ? "Criando grupo..." : "Criar grupo"}
          <ArrowRight size={18} />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
