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
  Trash2,
  UsersRound,
} from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { createExpense } from "@/features/expenses/actions/create-expense";
import { deleteExpense } from "@/features/expenses/actions/delete-expense";
import { updateExpense } from "@/features/expenses/actions/update-expense";
import { expenseCategoryOptions } from "@/features/expenses/lib/expense-categories";
import {
  formatInputAmount,
  getDistributedAmounts,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "@/features/expenses/lib/split-calculations";
import type { Group, GroupBalance } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";

type EditableExpense = {
  id: string;
  title: string;
  amount: number;
  categoryLabel: string;
  expenseDate: string;
  paidByProfileId: string;
  notes: string;
  splits: Array<{
    profile_id: string;
    amount_owed: number;
  }>;
  canManage: boolean;
};

type ExpenseComposerProps = {
  group: Group;
  groupQuery?: string;
  actionErrorMessage?: string;
  initialExpense?: EditableExpense;
};

type SplitParticipant = {
  profileId: string;
  member: string;
  initials: string;
  tone: GroupBalance["tone"];
  included: boolean;
  shareInput: string;
};

function formatDateInputValue(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayInputValue() {
  return formatDateInputValue(new Date());
}

function normalizeExpenseDate(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getTodayInputValue();
}

function buildParticipants(
  members: Group["members"],
  amount: number,
  initialSplits?: EditableExpense["splits"],
) {
  const splitByProfileId = new Map(
    (initialSplits ?? []).map((split) => [
      split.profile_id,
      Number(split.amount_owed),
    ]),
  );

  if (splitByProfileId.size > 0) {
    return members.map((member) => {
      const profileId = member.profileId ?? "";
      const splitAmount = splitByProfileId.get(profileId);

      return {
        profileId,
        member: member.member,
        initials: member.initials,
        tone: member.tone,
        included: splitAmount !== undefined,
        shareInput: formatInputAmount(splitAmount ?? 0),
      };
    });
  }

  const distributedAmounts = getDistributedAmounts(amount, members.length);

  return members.map((member, index) => ({
    profileId: member.profileId ?? "",
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

function getNextExpenseCategory(currentCategory: string) {
  const currentIndex = expenseCategoryOptions.findIndex(
    (option) => option.label === currentCategory,
  );
  const nextIndex =
    currentIndex === -1 || currentIndex === expenseCategoryOptions.length - 1
      ? 0
      : currentIndex + 1;

  return expenseCategoryOptions[nextIndex]?.label ?? "Outro";
}

export function ExpenseComposer({
  group,
  groupQuery,
  actionErrorMessage,
  initialExpense,
}: ExpenseComposerProps) {
  const router = useRouter();
  const isEditing = Boolean(initialExpense);
  const [amount, setAmount] = useState(() =>
    initialExpense ? formatInputAmount(initialExpense.amount) : "",
  );
  const [description, setDescription] = useState(initialExpense?.title ?? "");
  const [notes, setNotes] = useState(initialExpense?.notes ?? "");
  const [selectedDate, setSelectedDate] = useState(() =>
    normalizeExpenseDate(initialExpense?.expenseDate),
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialExpense?.categoryLabel ?? "Refeição",
  );
  const [splitMode, setSplitMode] = useState<"equal" | "manual">(
    initialExpense ? "manual" : "equal",
  );
  const [payer, setPayer] = useState(
    initialExpense?.paidByProfileId ?? group.members[0]?.profileId ?? "",
  );
  const [participants, setParticipants] = useState<SplitParticipant[]>(() =>
    buildParticipants(
      group.members,
      initialExpense?.amount ?? 0,
      initialExpense?.splits,
    ),
  );
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
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
        ({ profileId }) => profileId === participant.profileId,
      );

      return distributedAmounts[includedIndex] ?? 0;
    }

    return parseCurrencyInput(participant.shareInput);
  });
  const shareByMember = new Map(
    participants.map((participant, index) => [
      participant.profileId,
      effectiveShares[index] ?? 0,
    ]),
  );
  const manualAllocated = effectiveShares.reduce(
    (total, share) => total + share,
    0,
  );
  const remainingAmount =
    Math.round((numericAmount - manualAllocated) * 100) / 100;
  const selectedPayer = group.members.find(
    (member) => member.profileId === payer,
  );
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;
  const feedbackTitle =
    pendingAction === "delete"
      ? "Não foi possível excluir a despesa"
      : isEditing
        ? "Não foi possível atualizar a despesa"
        : "Não foi possível salvar a despesa";

  function handleSubmit() {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitErrorMessage("Informe um valor válido maior que zero.");
      return;
    }

    if (!description.trim()) {
      setSubmitErrorMessage("Descreva a despesa antes de salvar.");
      return;
    }

    if (!selectedDate) {
      setSubmitErrorMessage("Informe uma data válida para a despesa.");
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

    if (
      splitMode === "manual" &&
      Math.round(Math.abs(remainingAmount) * 100) !== 0
    ) {
      setSubmitErrorMessage(
        "A divisão manual precisa fechar exatamente com o valor total da despesa.",
      );
      return;
    }

    const expenseId = initialExpense?.id;
    const splits = participants
      .filter((participant) => participant.included && participant.profileId)
      .map((participant) => ({
        profileId: participant.profileId,
        amountOwed: shareByMember.get(participant.profileId) ?? 0,
      }));

    setSubmitErrorMessage(null);
    setPendingAction("save");
    startTransition(async () => {
      const result = isEditing
        ? expenseId
          ? await updateExpense({
              expenseId,
              groupSlug: group.slug,
              paidByProfileId: payer,
              title: description,
              categoryLabel: selectedCategory,
              amount: numericAmount,
              expenseDate: selectedDate,
              notes,
              splits,
            })
          : {
              ok: false as const,
              message: "Não foi possível identificar a despesa para edição.",
            }
        : await createExpense({
            groupId: group.id,
            groupSlug: group.slug,
            paidByProfileId: payer,
            title: description,
            categoryLabel: selectedCategory,
            amount: numericAmount,
            expenseDate: selectedDate,
            notes,
            splits,
          });

      if (!result.ok) {
        setSubmitErrorMessage(result.message);
        setPendingAction(null);
        return;
      }

      const nextQuery = new URLSearchParams(groupQuery ?? "");
      nextQuery.set(isEditing ? "expenseUpdated" : "expenseSaved", "1");

      router.push(`/grupos/${group.slug}?${nextQuery.toString()}`);
    });
  }

  function handleDelete() {
    if (!initialExpense?.canManage || !isEditing) {
      return;
    }

    const confirmed = window.confirm(
      "Excluir esta despesa vai recalcular os saldos do grupo. Deseja continuar?",
    );

    if (!confirmed) {
      return;
    }

    setSubmitErrorMessage(null);
    setPendingAction("delete");
    startTransition(async () => {
      const result = await deleteExpense(initialExpense.id, group.slug);

      if (!result.ok) {
        setSubmitErrorMessage(result.message);
        setPendingAction(null);
        return;
      }

      const nextQuery = new URLSearchParams(groupQuery ?? "");
      nextQuery.set("expenseDeleted", "1");

      router.push(`/grupos/${group.slug}?${nextQuery.toString()}`);
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title={isEditing ? "Editar despesa" : "Adicionar despesa"}
        leading={
          <Link href={groupHref} className="icon-button" aria-label="Fechar">
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <span className="top-bar__eyebrow top-bar__eyebrow--badge">
            {isEditing ? "Editando" : "Despesa real"}
          </span>
        }
      />

      <main className="page-content">
        {feedbackMessage ? (
          <ActionFeedback title={feedbackTitle} message={feedbackMessage} />
        ) : null}

        <section className="hero-copy hero-copy--card">
          <span className="eyebrow-note">Composer de despesa</span>
          <h1>
            {isEditing
              ? "Ajuste a despesa sem perder a coerência do saldo do grupo."
              : "Registre a despesa com pagador e divisão coerentes."}
          </h1>
          <p>
            {isEditing
              ? "Você pode corrigir valor, data, pagador e divisão. O grupo é recalculado depois da alteração."
              : "Escolha quem pagou, quem participa e como cada cota será dividida."}
          </p>
          <div className="page-meta-pills">
            <span className="meta-pill">{group.name}</span>
            <span className="meta-pill">
              {includedParticipants.length} participante(s)
            </span>
            <span className="meta-pill">
              {splitMode === "equal" ? "Divisão igual" : "Divisão manual"}
            </span>
          </div>
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

        <section className="surface-card stack-column">
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
            <label>
              <span className="field-label">Data</span>
              <div className="selector-card">
                <span className="selector-card__copy">
                  <CalendarDays size={16} />
                  <input
                    className="input-plain"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setSubmitErrorMessage(null);
                    }}
                    max={getTodayInputValue()}
                    aria-label="Data da despesa"
                  />
                </span>
              </div>
            </label>

            <div>
              <span className="field-label">Categoria</span>
              <button
                className="selector-card"
                type="button"
                onClick={() => {
                  setSelectedCategory((current) =>
                    getNextExpenseCategory(current),
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
          </div>

          <label>
            <span className="field-label">Observações</span>
            <textarea
              className="input-plain"
              value={notes}
              placeholder="Opcional: detalhe curto para lembrar o contexto da despesa."
              rows={3}
              onChange={(event) => {
                setNotes(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
        </section>

        <section className="surface-section section-stack">
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
              const isSelected = payer === member.profileId;

              return (
                <button
                  key={member.profileId ?? member.member}
                  className={`member-choice${isSelected ? " is-active" : ""}`}
                  type="button"
                  onClick={() => {
                    setPayer(member.profileId ?? "");
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

        <section className="surface-section section-stack">
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
                  key={participant.profileId || participant.member}
                  className={`member-split-row${participant.included ? "" : " is-disabled"}`}
                >
                  <button
                    className={`member-toggle${participant.included ? " is-active" : ""}`}
                    type="button"
                    onClick={() => {
                      setParticipants((current) =>
                        current.map((item) =>
                          item.profileId === participant.profileId
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
                              item.profileId === participant.profileId
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
                    ? (selectedPayer?.member ?? "Sem pagador")
                    : formatCurrency(Math.abs(remainingAmount))}
                </strong>
              </div>
            </div>
          </article>
        </section>

        {isEditing && initialExpense?.canManage ? (
          <button
            className="ghost-link"
            type="button"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 size={16} />
            {pendingAction === "delete" && isPending
              ? "Excluindo despesa..."
              : "Excluir despesa"}
          </button>
        ) : null}

        <button
          className="primary-button primary-button--full"
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {pendingAction === "save" && isPending
            ? isEditing
              ? "Atualizando despesa..."
              : "Salvando despesa..."
            : isEditing
              ? `Salvar alteração - ${formatCurrency(numericAmount)}`
              : `Salvar despesa - ${formatCurrency(numericAmount)}`}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
