"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarDays,
  ChevronDown,
  CircleEqual,
  Eraser,
  PencilLine,
  ReceiptText,
  Settings2,
} from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { formatCurrency } from "@/lib/format";

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

type ExpenseComposerProps = {
  groupSlug: string;
  groupQuery?: string;
  actionErrorMessage?: string;
};

export function ExpenseComposer({
  groupSlug,
  groupQuery,
  actionErrorMessage,
}: ExpenseComposerProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("124.50");
  const [description, setDescription] = useState("Jantar no Blue Lagoon");
  const [selectedDate, setSelectedDate] = useState("Hoje");
  const [selectedCategory, setSelectedCategory] = useState("Refeição");
  const [splitMode, setSplitMode] = useState<"equal" | "manual">("equal");
  const [payer, setPayer] = useState<"you" | "group">("you");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const detailParams = new URLSearchParams(groupQuery ?? "");
  const groupHref = `/grupos/${groupSlug}${groupQuery ? `?${groupQuery}` : ""}`;

  const numericAmount = Number(amount || 0);
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  function appendValue(value: string) {
    setSubmitErrorMessage(null);
    setAmount((current) => {
      if (value === "." && current.includes(".")) {
        return current;
      }

      if (current === "0" && value !== ".") {
        return value;
      }

      return `${current}${value}`;
    });
  }

  function eraseValue() {
    setSubmitErrorMessage(null);
    setAmount((current) => {
      if (current.length <= 1) {
        return "0";
      }

      return current.slice(0, -1);
    });
  }

  function handleSubmit() {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setSubmitErrorMessage("Informe um valor válido maior que zero.");
      return;
    }

    if (!description.trim()) {
      setSubmitErrorMessage("Descreva a despesa antes de confirmar o split.");
      return;
    }

    setSubmitErrorMessage(null);
    detailParams.set("expenseSaved", "1");
    startTransition(() => {
      router.push(`/grupos/${groupSlug}?${detailParams.toString()}`);
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

        <section className="expense-amount">
          <span className="section-label">Digite o valor</span>
          <div className="expense-amount__value">
            <span className="expense-amount__currency">R$</span>
            <strong>{numericAmount.toFixed(2)}</strong>
          </div>
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
              <h2>Detalhes da divisão</h2>
            </div>
            <button
              className="ghost-link ghost-link--compact"
              type="button"
              onClick={() => {
                setSplitMode((current) =>
                  current === "equal" ? "manual" : "equal",
                );
                setSubmitErrorMessage(null);
              }}
            >
              {splitMode === "equal"
                ? "Ativar divisão manual"
                : "Usar divisão igual"}
            </button>
          </div>

          <div className="split-grid split-grid--stack">
            <article className="surface-card">
              <span className="section-label">Pago por</span>
              <div className="inline-card">
                <div className="inline-card__avatar">JV</div>
                <div>
                  <strong>{payer === "you" ? "Você" : "Grupo"}</strong>
                  <p>
                    {payer === "you" ? "Valor integral" : "Reembolso coletivo"}
                  </p>
                </div>
                <button
                  className="icon-button icon-button--soft"
                  type="button"
                  aria-label="Trocar pagador"
                  onClick={() => {
                    setPayer((current) =>
                      current === "you" ? "group" : "you",
                    );
                    setSubmitErrorMessage(null);
                  }}
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>
            </article>

            <article className="surface-card">
              <span className="section-label">Método</span>
              <div className="inline-card">
                <div className="inline-card__avatar inline-card__avatar--soft">
                  <CircleEqual size={18} />
                </div>
                <div>
                  <strong>
                    {splitMode === "equal"
                      ? "Igual para todos"
                      : "Divisão manual mock"}
                  </strong>
                  <p>
                    {splitMode === "equal"
                      ? "4 participantes"
                      : "2 cotas ajustadas manualmente"}
                  </p>
                </div>
                <button
                  className="icon-button icon-button--soft"
                  type="button"
                  aria-label="Editar divisão"
                  onClick={() => {
                    setSplitMode((current) =>
                      current === "equal" ? "manual" : "equal",
                    );
                    setSubmitErrorMessage(null);
                  }}
                >
                  <PencilLine size={16} />
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="keypad-card">
          <div className="keypad-grid">
            {keypad.map((item) => (
              <button
                key={item}
                className="keypad-button"
                type="button"
                onClick={() => appendValue(item)}
              >
                {item}
              </button>
            ))}
            <button
              className="keypad-button"
              type="button"
              onClick={eraseValue}
              aria-label="Apagar"
            >
              <Eraser size={18} />
            </button>
          </div>

          <button
            className="primary-button primary-button--full"
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? "Salvando despesa..."
              : `Confirmar split - ${formatCurrency(numericAmount)}`}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
