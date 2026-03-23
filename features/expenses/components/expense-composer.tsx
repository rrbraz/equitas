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
import { useState } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { formatCurrency } from "@/lib/format";

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

type ExpenseComposerProps = {
  groupSlug: string;
};

export function ExpenseComposer({ groupSlug }: ExpenseComposerProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("124.50");
  const [description, setDescription] = useState("Jantar no Blue Lagoon");
  const groupHref = `/grupos/${groupSlug}`;

  const numericAmount = Number(amount || 0);

  function appendValue(value: string) {
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
    setAmount((current) => {
      if (current.length <= 1) {
        return "0";
      }

      return current.slice(0, -1);
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
            <button className="ghost-link" type="button">
              Salvar
            </button>
            <button className="icon-button" type="button" aria-label="Ajustes">
              <Settings2 size={18} />
            </button>
          </div>
        }
      />

      <main className="page-content">
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
              onChange={(event) => setDescription(event.target.value)}
              placeholder="No que você gastou?"
            />
          </label>

          <div className="split-grid">
            <button className="selector-card" type="button">
              <span className="selector-card__copy">
                <CalendarDays size={16} />
                Hoje
              </span>
              <ChevronDown size={16} />
            </button>
            <button className="selector-card" type="button">
              <span className="selector-card__copy">
                <PencilLine size={16} />
                Dining
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
            <button className="ghost-link ghost-link--compact" type="button">
              Divisão avançada
            </button>
          </div>

          <div className="split-grid split-grid--stack">
            <article className="surface-card">
              <span className="section-label">Pago por</span>
              <div className="inline-card">
                <div className="inline-card__avatar">JV</div>
                <div>
                  <strong>Você</strong>
                  <p>Valor integral</p>
                </div>
                <button
                  className="icon-button icon-button--soft"
                  type="button"
                  aria-label="Trocar pagador"
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
                  <strong>Igual para todos</strong>
                  <p>4 participantes</p>
                </div>
                <button
                  className="icon-button icon-button--soft"
                  type="button"
                  aria-label="Editar divisão"
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
            onClick={() => router.push(groupHref)}
          >
            Confirmar split - {formatCurrency(numericAmount)}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
