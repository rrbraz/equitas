"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  BadgeCheck,
} from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { createSettlement } from "@/features/groups/actions/create-settlement";
import {
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "@/features/expenses/lib/split-calculations";
import { TopBar } from "@/components/top-bar";
import type { Group } from "@/features/groups/types";
import type { Viewer } from "@/features/viewer/types";
import { formatCurrency } from "@/lib/format";

type GroupSettlementScreenProps = {
  viewer: Viewer;
  group: Group;
  groupQuery?: string;
};

function getSuggestedTransferAmount(
  payerBalance: number | undefined,
  receiverBalance: number | undefined,
) {
  if (payerBalance === undefined || receiverBalance === undefined) {
    return "0.00";
  }

  const suggestedAmount = Math.min(Math.abs(payerBalance), receiverBalance);

  return suggestedAmount > 0 ? suggestedAmount.toFixed(2) : "0.00";
}

export function GroupSettlementScreen({
  viewer,
  group,
  groupQuery,
}: GroupSettlementScreenProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const debtors = group.members.filter((member) => member.balance < 0);
  const creditors = group.members.filter((member) => member.balance > 0);
  const [payerProfileId, setPayerProfileId] = useState(
    debtors[0]?.profileId ?? "",
  );
  const [receiverProfileId, setReceiverProfileId] = useState(
    creditors[0]?.profileId ?? "",
  );
  const [amount, setAmount] = useState(() =>
    getSuggestedTransferAmount(debtors[0]?.balance, creditors[0]?.balance),
  );
  const detailParams = new URLSearchParams(groupQuery ?? "");

  const selectedPayer = debtors.find(
    (member) => member.profileId === payerProfileId,
  );
  const selectedReceiver = creditors.find(
    (member) => member.profileId === receiverProfileId,
  );
  const numericAmount = parseCurrencyInput(amount);
  const maxTransferAmount =
    selectedPayer && selectedReceiver
      ? Math.min(Math.abs(selectedPayer.balance), selectedReceiver.balance)
      : 0;

  function handleConfirm() {
    if (!selectedPayer || !selectedReceiver) {
      setSubmitErrorMessage("Selecione quem transfere e quem recebe.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitErrorMessage("Informe um valor de transferência válido.");
      return;
    }

    if (numericAmount > maxTransferAmount) {
      setSubmitErrorMessage(
        "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(async () => {
      const result = await createSettlement({
        groupId: group.id,
        groupSlug: group.slug,
        payerProfileId: selectedPayer.profileId ?? "",
        receiverProfileId: selectedReceiver.profileId ?? "",
        amount: numericAmount,
      });

      if (!result.ok) {
        setSubmitErrorMessage(result.message);
        return;
      }

      detailParams.set("settlementSaved", "1");
      const nextQuery = detailParams.toString();

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
        title="Transferir saldo"
        leading={
          <Link
            href={`/grupos/${group.slug}${groupQuery ? `?${groupQuery}` : ""}`}
            className="icon-button"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <span className="top-bar__eyebrow top-bar__eyebrow--badge">
            {viewer.initials}
          </span>
        }
      />

      <main className="page-content">
        <section className="hero-copy hero-copy--card">
          <span className="eyebrow-note">Fluxo de quitação</span>
          <h1>Quite o saldo com uma transferência entre membros.</h1>
          <p>
            Escolha quem paga, quem recebe e registre o valor que sai do grupo
            pendente.
          </p>
          <div className="page-meta-pills">
            <span className="meta-pill">{group.name}</span>
            <span className="meta-pill">{debtors.length} devedor(es)</span>
            <span className="meta-pill">{creditors.length} credor(es)</span>
          </div>
        </section>

        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível registrar a transferência"
            message={submitErrorMessage}
          />
        ) : null}

        {debtors.length === 0 || creditors.length === 0 ? (
          <EmptyState
            eyebrow="Nada para transferir"
            title="Este grupo não tem saldo pendente entre membros"
            description="Quando houver alguém com valor a pagar e outro com valor a receber, a transferência aparece aqui."
            actionHref={`/grupos/${group.slug}${groupQuery ? `?${groupQuery}` : ""}`}
            actionLabel="Voltar ao grupo"
          />
        ) : (
          <>
            <section className="surface-section section-stack">
              <div className="section-heading">
                <div>
                  <h2>Quem transfere</h2>
                  <p className="supporting-copy">
                    Membros com saldo negativo podem quitar o grupo.
                  </p>
                </div>
              </div>

              <div className="stack-column">
                {debtors.map((member) => {
                  const isSelected = payerProfileId === member.profileId;

                  return (
                    <button
                      key={member.profileId ?? member.member}
                      className={`member-choice${isSelected ? " is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        setPayerProfileId(member.profileId ?? "");
                        setAmount(
                          getSuggestedTransferAmount(
                            member.balance,
                            selectedReceiver?.balance,
                          ),
                        );
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
                      <span className="member-choice__meta money-negative">
                        {formatCurrency(Math.abs(member.balance))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="surface-section section-stack">
              <div className="section-heading">
                <div>
                  <h2>Quem recebe</h2>
                  <p className="supporting-copy">
                    Escolha o membro que está com valor a receber.
                  </p>
                </div>
              </div>

              <div className="stack-column">
                {creditors.map((member) => {
                  const isSelected = receiverProfileId === member.profileId;

                  return (
                    <button
                      key={member.profileId ?? member.member}
                      className={`member-choice${isSelected ? " is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        setReceiverProfileId(member.profileId ?? "");
                        setAmount(
                          getSuggestedTransferAmount(
                            selectedPayer?.balance,
                            member.balance,
                          ),
                        );
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
                      <span className="member-choice__meta money-positive">
                        {formatCurrency(member.balance)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="surface-section section-stack">
              <span className="section-label">Valor da transferência</span>
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
                  aria-label="Valor da transferência"
                />
              </label>
              <p className="supporting-copy">
                Limite sugerido para esta dupla:{" "}
                {formatCurrency(maxTransferAmount)}
              </p>
            </section>

            <section className="surface-section section-stack">
              <div className="inline-card">
                <div className="inline-card__avatar inline-card__avatar--soft">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <strong>Resumo da transferência</strong>
                  <p>
                    {selectedPayer?.member} transfere{" "}
                    {formatCurrency(numericAmount)} para{" "}
                    {selectedReceiver?.member}.
                  </p>
                </div>
              </div>

              <div className="transfer-summary-grid">
                <div>
                  <span className="section-label">Saldo devedor</span>
                  <strong className="money-negative">
                    {formatCurrency(Math.abs(selectedPayer?.balance ?? 0))}
                  </strong>
                </div>
                <div>
                  <span className="section-label">Saldo credor</span>
                  <strong className="money-positive">
                    {formatCurrency(selectedReceiver?.balance ?? 0)}
                  </strong>
                </div>
              </div>
            </section>

            <button
              type="button"
              className="primary-button primary-button--full"
              onClick={handleConfirm}
              disabled={isPending}
            >
              <BadgeCheck size={18} />
              {isPending
                ? "Registrando..."
                : `Registrar transferência - ${formatCurrency(numericAmount)}`}
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
