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
import { TopBar } from "@/components/top-bar";
import type { Group } from "@/features/groups/types";
import type { Viewer } from "@/features/viewer/types";
import { formatCurrency } from "@/lib/format";

type GroupSettlementScreenProps = {
  viewer: Viewer;
  group: Group;
  groupQuery?: string;
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
  const [payer, setPayer] = useState(debtors[0]?.member ?? "");
  const [receiver, setReceiver] = useState(creditors[0]?.member ?? "");
  const [amount, setAmount] = useState(() =>
    getSuggestedTransferAmount(debtors[0]?.balance, creditors[0]?.balance),
  );
  const detailParams = new URLSearchParams(groupQuery ?? "");

  const selectedPayer = debtors.find((member) => member.member === payer);
  const selectedReceiver = creditors.find(
    (member) => member.member === receiver,
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
    detailParams.set("settled", "1");
    detailParams.set("transferPayer", selectedPayer.member);
    detailParams.set("transferReceiver", selectedReceiver.member);
    detailParams.set("transferAmount", numericAmount.toFixed(2));
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
        trailing={<span className="top-bar__eyebrow">{viewer.initials}</span>}
      />

      <main className="page-content">
        <section className="hero-copy">
          <span className="eyebrow-note">{group.name}</span>
          <h1>Quite o saldo com uma transferência entre membros.</h1>
          <p>
            Escolha quem paga, quem recebe e registre o valor que sai do grupo
            pendente.
          </p>
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
            <section className="stack-column">
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
                  const isSelected = payer === member.member;

                  return (
                    <button
                      key={member.member}
                      className={`member-choice${isSelected ? " is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        setPayer(member.member);
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

            <section className="stack-column">
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
                  const isSelected = receiver === member.member;

                  return (
                    <button
                      key={member.member}
                      className={`member-choice${isSelected ? " is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        setReceiver(member.member);
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

            <section className="surface-card stack-column">
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

            <section className="surface-card stack-column">
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
              {isPending ? "Registrando..." : "Registrar transferência mock"}
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
