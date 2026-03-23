"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleEqual,
  PencilLine,
  ReceiptText,
  Settings2,
  UsersRound,
} from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import type { Group, GroupBalance } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";

type ExpenseComposerProps = {
  group: Group;
  groupQuery?: string;
  actionErrorMessage?: string;
};

type SplitParticipant = {
  member: string;
  initials: string;
  tone: GroupBalance["tone"];
  included: boolean;
  shareInput: string;
};

function sanitizeCurrencyInput(value: string) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [integerPart = "", ...decimalParts] = normalized.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);

  if (!integerPart && normalized.startsWith(".")) {
    return `0.${decimalPart}`;
  }

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

function parseCurrencyInput(value: string) {
  return Number(sanitizeCurrencyInput(value) || 0);
}

function formatInputAmount(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function getDistributedAmounts(totalAmount: number, count: number) {
  if (count <= 0) {
    return [];
  }

  const totalInCents = Math.round(totalAmount * 100);
  const baseShare = Math.floor(totalInCents / count);
  const remainder = totalInCents % count;

  return Array.from({ length: count }, (_, index) => {
    const shareInCents = baseShare + (index < remainder ? 1 : 0);

    return shareInCents / 100;
  });
}

function buildParticipants(members: Group["members"], amount: number) {
  const distributedAmounts = getDistributedAmounts(amount, members.length);

  return members.map((member, index) => ({
    member: member.member,
    initials: member.initials,
    tone: member.tone,
    included: true,
    shareInput: formatInputAmount(distributedAmounts[index] ?? 0),
  }));
}

function seedManualShares(
  participants: SplitParticipant[],
  amount: number,
): SplitParticipant[] {
  const includedParticipants = participants.filter(
    (participant) => participant.included,
  );
  const distributedAmounts = getDistributedAmounts(
    amount,
    includedParticipants.length,
  );

  let includedIndex = 0;

  return participants.map((participant) => {
    if (!participant.included) {
      return {
        ...participant,
        shareInput: "0.00",
      };
    }

    const share = distributedAmounts[includedIndex] ?? 0;
    includedIndex += 1;

    return {
      ...participant,
      shareInput: formatInputAmount(share),
    };
  });
}

export function ExpenseComposer({
  group,
  groupQuery,
  actionErrorMessage,
}: ExpenseComposerProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("124.50");
  const [description, setDescription] = useState("Jantar no Blue Lagoon");
  const [selectedDate, setSelectedDate] = useState("Hoje");
  const [selectedCategory, setSelectedCategory] = useState("Refeição");
  const [splitMode, setSplitMode] = useState<"equal" | "manual">("equal");
  const [payer, setPayer] = useState(group.members[0]?.member ?? "");
  const [participants, setParticipants] = useState<SplitParticipant[]>(() =>
    buildParticipants(group.members, 124.5),
  );
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const detailParams = new URLSearchParams(groupQuery ?? "");
  const groupHref = `/grupos/${group.slug}${groupQuery ? `?${groupQuery}` : ""}`;

  const numericAmount = parseCurrencyInput(amount);
  const includedParticipants = participants.filter(
    (participant) => participant.included,
  );
  const distributedAmounts = getDistributedAmounts(
    numericAmount,
    includedParticipants.length,
  );
  const effectiveShares = participants.map((participant) => {
    if (!participant.included) {
      return 0;
    }

    if (splitMode === "equal") {
      const includedIndex = includedParticipants.findIndex(
        ({ member }) => member === participant.member,
      );

      return distributedAmounts[includedIndex] ?? 0;
    }

    return parseCurrencyInput(participant.shareInput);
  });
  const shareByMember = new Map(
    participants.map((participant, index) => [
      participant.member,
      effectiveShares[index] ?? 0,
    ]),
  );
  const manualAllocated = effectiveShares.reduce(
    (total, share) => total + share,
    0,
  );
  const remainingAmount =
    Math.round((numericAmount - manualAllocated) * 100) / 100;
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  function handleSubmit() {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitErrorMessage("Informe um valor válido maior que zero.");
      return;
    }

    if (!description.trim()) {
      setSubmitErrorMessage("Descreva a despesa antes de salvar.");
      return;
    }

    if (!payer) {
      setSubmitErrorMessage("Selecione quem pagou a despesa.");
      return;
    }

    if (includedParticipants.length === 0) {
      setSubmitErrorMessage("Escolha ao menos um participante para dividir.");
      return;
    }

    if (splitMode === "manual" && remainingAmount !== 0) {
      setSubmitErrorMessage(
        "A divisão manual precisa fechar exatamente com o valor total da despesa.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    detailParams.set("expenseSaved", "1");
    detailParams.set("expenseTitle", description.trim());
    detailParams.set("expenseAmount", formatInputAmount(numericAmount));
    detailParams.set("expensePaidBy", payer);
    detailParams.set("expenseCategory", selectedCategory);
    detailParams.set(
      "expenseSplit",
      participants
        .filter((participant) => participant.included)
        .map((participant) => {
          const share = shareByMember.get(participant.member) ?? 0;

          return `${participant.member}:${formatInputAmount(share)}`;
        })
        .join("|"),
    );
    const nextQuery = detailParams.toString();

    startTransition(() => {
      router.push(
        nextQuery
          ? `/grupos/${group.slug}?${nextQuery}`
          : `/grupos/${group.slug}`,
      );
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title="Adicionar despesa"
        leading={
          <Link href={groupHref} className="icon-button" aria-label="Fechar">
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <div className="top-bar__action-group">
            <button
              className="ghost-link"
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <span className="top-bar__eyebrow">
              <Settings2 size={16} />
              Mock
            </span>
          </div>
        }
      />

      <main className="page-content">
        {feedbackMessage ? (
          <ActionFeedback
            title="Não foi possível salvar a despesa"
            message={feedbackMessage}
          />
        ) : null}

        <section className="hero-copy">
          <span className="eyebrow-note">{group.name}</span>
          <h1>Registre a despesa com pagador e divisão coerentes.</h1>
          <p>
            Escolha quem pagou, quem participa e como cada cota será dividida.
          </p>
        </section>

        <section className="surface-card stack-column">
          <span className="section-label">Valor da despesa</span>
          <label className="currency-field">
            <span className="currency-field__prefix">R$</span>
            <input
              value={amount}
              onChange={(event) => {
                setAmount(sanitizeCurrencyInput(event.target.value));
                setSubmitErrorMessage(null);
              }}
              inputMode="decimal"
              placeholder="0,00"
              aria-label="Valor da despesa"
            />
          </label>
          <p className="supporting-copy">
            Total atual: {formatCurrency(numericAmount || 0)}
          </p>
        </section>

        <section className="stack-column">
          <label className="input-shell">
            <span className="input-shell__icon">
              <ReceiptText size={18} />
            </span>
            <input
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setSubmitErrorMessage(null);
              }}
              placeholder="No que você gastou?"
            />
          </label>

          <div className="split-grid">
            <button
              className="selector-card"
              type="button"
              onClick={() => {
                setSelectedDate((current) =>
                  current === "Hoje" ? "Ontem" : "Hoje",
                );
                setSubmitErrorMessage(null);
              }}
            >
              <span className="selector-card__copy">
                <CalendarDays size={16} />
                {selectedDate}
              </span>
              <ChevronDown size={16} />
            </button>
            <button
              className="selector-card"
              type="button"
              onClick={() => {
                setSelectedCategory((current) =>
                  current === "Refeição" ? "Transporte" : "Refeição",
                );
                setSubmitErrorMessage(null);
              }}
            >
              <span className="selector-card__copy">
                <PencilLine size={16} />
                {selectedCategory}
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <div>
              <h2>Quem pagou</h2>
              <p className="supporting-copy">
                O pagador é sempre um membro específico do grupo.
              </p>
            </div>
          </div>

          <div className="stack-column">
            {group.members.map((member) => {
              const isSelected = payer === member.member;

              return (
                <button
                  key={member.member}
                  className={`member-choice${isSelected ? " is-active" : ""}`}
                  type="button"
                  onClick={() => {
                    setPayer(member.member);
                    setSubmitErrorMessage(null);
                  }}
                >
                  <Avatar
                    name={member.member}
                    initials={member.initials}
                    tone={member.tone}
                    size="sm"
                  />
                  <div className="member-choice__copy">
                    <strong>{member.member}</strong>
                    <p>{member.role}</p>
                  </div>
                  <span className="member-choice__meta">
                    {isSelected ? "Pagador" : "Selecionar"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <div>
              <h2>Divisão da despesa</h2>
              <p className="supporting-copy">
                Escolha os participantes e ajuste as cotas quando necessário.
              </p>
            </div>
            <button
              className="ghost-link ghost-link--compact"
              type="button"
              onClick={() => {
                setSplitMode((current) => {
                  const nextMode = current === "equal" ? "manual" : "equal";

                  if (nextMode === "manual") {
                    setParticipants((currentParticipants) =>
                      seedManualShares(currentParticipants, numericAmount),
                    );
                  }

                  return nextMode;
                });
                setSubmitErrorMessage(null);
              }}
            >
              {splitMode === "equal"
                ? "Ativar divisão manual"
                : "Usar divisão igual"}
            </button>
          </div>

          <article className="surface-card">
            <div className="inline-card">
              <div className="inline-card__avatar inline-card__avatar--soft">
                {splitMode === "equal" ? (
                  <CircleEqual size={18} />
                ) : (
                  <PencilLine size={18} />
                )}
              </div>
              <div>
                <strong>
                  {splitMode === "equal" ? "Divisão igual" : "Divisão manual"}
                </strong>
                <p>
                  {splitMode === "equal"
                    ? `${includedParticipants.length} participante(s) com cota automática`
                    : `${includedParticipants.length} participante(s) com cota editável`}
                </p>
              </div>
            </div>
          </article>

          <div className="stack-column">
            {participants.map((participant, index) => {
              const share = effectiveShares[index] ?? 0;

              return (
                <article
                  key={participant.member}
                  className={`member-split-row${participant.included ? "" : " is-disabled"}`}
                >
                  <button
                    className={`member-toggle${participant.included ? " is-active" : ""}`}
                    type="button"
                    onClick={() => {
                      setParticipants((current) =>
                        current.map((item) =>
                          item.member === participant.member
                            ? {
                                ...item,
                                included: !item.included,
                                shareInput: item.included
                                  ? "0.00"
                                  : item.shareInput,
                              }
                            : item,
                        ),
                      );
                      setSubmitErrorMessage(null);
                    }}
                    aria-label={
                      participant.included
                        ? `Remover ${participant.member} da divisão`
                        : `Incluir ${participant.member} na divisão`
                    }
                  >
                    <Check size={14} />
                  </button>

                  <Avatar
                    name={participant.member}
                    initials={participant.initials}
                    tone={participant.tone}
                    size="sm"
                  />

                  <div className="member-split-row__copy">
                    <strong>{participant.member}</strong>
                    <p>
                      {participant.included
                        ? "Participando da divisão"
                        : "Fora desta despesa"}
                    </p>
                  </div>

                  {splitMode === "manual" ? (
                    <label className="member-share-field">
                      <span>R$</span>
                      <input
                        value={participant.shareInput}
                        onChange={(event) => {
                          const nextValue = sanitizeCurrencyInput(
                            event.target.value,
                          );

                          setParticipants((current) =>
                            current.map((item) =>
                              item.member === participant.member
                                ? {
                                    ...item,
                                    shareInput: nextValue,
                                  }
                                : item,
                            ),
                          );
                          setSubmitErrorMessage(null);
                        }}
                        inputMode="decimal"
                        aria-label={`Cota de ${participant.member}`}
                        disabled={!participant.included}
                      />
                    </label>
                  ) : (
                    <div className="member-split-row__value">
                      <span>Cota</span>
                      <strong>{formatCurrency(share)}</strong>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <article className="surface-card split-summary-card">
            <div className="inline-card">
              <div className="inline-card__avatar inline-card__avatar--soft">
                <UsersRound size={18} />
              </div>
              <div>
                <strong>Resumo da divisão</strong>
                <p>
                  {splitMode === "equal"
                    ? "As cotas são recalculadas automaticamente."
                    : "Ajuste as cotas até fechar o valor da despesa."}
                </p>
              </div>
            </div>

            <div className="split-summary-card__metrics">
              <div>
                <span className="section-label">Total</span>
                <strong>{formatCurrency(numericAmount || 0)}</strong>
              </div>
              <div>
                <span className="section-label">
                  {splitMode === "equal" ? "Participantes" : "Alocado"}
                </span>
                <strong>
                  {splitMode === "equal"
                    ? `${includedParticipants.length}`
                    : formatCurrency(manualAllocated)}
                </strong>
              </div>
              <div>
                <span className="section-label">
                  {splitMode === "equal" ? "Pagador" : "Diferença"}
                </span>
                <strong
                  className={
                    splitMode === "equal"
                      ? undefined
                      : remainingAmount === 0
                        ? "money-positive"
                        : "money-negative"
                  }
                >
                  {splitMode === "equal"
                    ? payer || "Sem pagador"
                    : formatCurrency(Math.abs(remainingAmount))}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <button
          className="primary-button primary-button--full"
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending
            ? "Salvando despesa..."
            : `Salvar despesa - ${formatCurrency(numericAmount)}`}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
