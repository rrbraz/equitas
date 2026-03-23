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
import { useState, useTransition } from "react";

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
  createGroupHref: string;
  actionErrorMessage?: string;
};

export function CreateGroupScreen({
  viewer,
  categories,
  selectedMembers,
  frequentConnections,
  createGroupHref,
  actionErrorMessage,
}: CreateGroupScreenProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("Summer Roadtrip");
  const [activeCategory, setActiveCategory] = useState(
    categories[0] ?? "Other",
  );
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  function handleSubmit() {
    if (!groupName.trim()) {
      setSubmitErrorMessage(
        "Defina um nome claro para o grupo antes de criar.",
      );
      return;
    }

    if (selectedMembers.length === 0) {
      setSubmitErrorMessage(
        "Adicione pelo menos um participante para iniciar o grupo.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(() => {
      router.push(createGroupHref);
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
          <span className="eyebrow-note">New circle</span>
          <h1>Crie um grupo com cara de private desk.</h1>
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
            <h2>Add members</h2>
            <span className="stat-chip stat-chip--positive">
              {selectedMembers.length} added
            </span>
          </div>

          <label className="input-shell">
            <span className="input-shell__icon">
              <Search size={18} />
            </span>
            <input placeholder="Search contacts or type email" />
          </label>

          <div className="member-pills">
            {selectedMembers.map((member) => (
              <button
                key={member.name}
                type="button"
                className="member-chip split-pill"
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
        </section>

        <section className="report-card stack-column">
          <div className="section-heading">
            <h2>Frequent connections</h2>
            <Sparkles size={18} color="var(--primary-bright)" />
          </div>
          <div className="quick-grid">
            {frequentConnections.map((contact) => (
              <article key={contact.name} className="quick-card">
                <Avatar
                  name={contact.name}
                  initials={contact.initials}
                  tone={contact.tone}
                  size="md"
                />
                <strong>{contact.name}</strong>
                <p className="list-card__meta">Adicionar rápido</p>
              </article>
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
