import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ActionFeedback } from "../components/action-feedback.tsx";
import { getButtonClassName } from "../components/button.tsx";
import { EmptyState } from "../components/empty-state.tsx";
import { MetaPills } from "../components/meta-pills.tsx";
import { PageIntro } from "../components/page-intro.tsx";
import { SectionBlock, SectionHeader } from "../components/section-block.tsx";

test("getButtonClassName compõe variantes do design system", () => {
  assert.equal(getButtonClassName({}), "primary-button");
  assert.equal(
    getButtonClassName({
      variant: "secondary",
      fullWidth: true,
      className: "extra-class",
    }),
    "secondary-button secondary-button--full extra-class",
  );
});

test("PageIntro renderiza a abertura padronizada da tela", () => {
  const markup = renderToStaticMarkup(
    createElement(PageIntro, {
      eyebrow: "Design system",
      title: "Tela consistente",
      description: "Texto de apoio do fluxo.",
      tone: "card",
      meta: createElement(MetaPills, {
        items: ["3 blocos", "2 acoes"],
      }),
      actions: createElement("a", { href: "/grupos" }, "Abrir grupos"),
    }),
  );

  assert.match(markup, /hero-copy hero-copy--card/);
  assert.match(markup, /Design system/);
  assert.match(markup, /Tela consistente/);
  assert.match(markup, /Texto de apoio do fluxo\./);
  assert.match(markup, /meta-pill/);
  assert.match(markup, /page-intro__actions/);
  assert.match(markup, /Abrir grupos/);
});

test("SectionHeader e SectionBlock mantêm a hierarquia de seção", () => {
  const headerMarkup = renderToStaticMarkup(
    createElement(SectionHeader, {
      eyebrow: "Resumo",
      title: "Fluxo financeiro",
      description: "Contexto curto",
      trailing: createElement("span", null, "Ver mais"),
    }),
  );
  const blockMarkup = renderToStaticMarkup(
    createElement(
      SectionBlock,
      {
        title: "Seus grupos",
        description: "Acesso rápido",
        trailing: createElement("span", null, "Todos"),
      },
      createElement("div", null, "Lista principal"),
    ),
  );

  assert.match(headerMarkup, /section-heading/);
  assert.match(headerMarkup, /Resumo/);
  assert.match(headerMarkup, /Fluxo financeiro/);
  assert.match(headerMarkup, /Contexto curto/);
  assert.match(blockMarkup, /surface-section section-stack/);
  assert.match(blockMarkup, /Seus grupos/);
  assert.match(blockMarkup, /Lista principal/);
});

test("EmptyState mantém CTA consistente com botão full width", () => {
  const markup = renderToStaticMarkup(
    createElement(EmptyState, {
      title: "Nada por aqui",
      description: "Crie o primeiro item.",
      actionHref: "/grupos/criar",
      actionLabel: "Criar grupo",
    }),
  );

  assert.match(markup, /state-card/);
  assert.match(markup, /Criar grupo/);
  assert.match(markup, /primary-button primary-button--full/);
  assert.match(markup, /href="\/grupos\/criar"/);
});

test("ActionFeedback preserva o tom e o papel semântico", () => {
  const successMarkup = renderToStaticMarkup(
    createElement(ActionFeedback, {
      tone: "success",
      title: "Tudo certo",
      message: "Mudança aplicada com sucesso.",
    }),
  );
  const errorMarkup = renderToStaticMarkup(
    createElement(ActionFeedback, {
      tone: "error",
      title: "Falhou",
      message: "Ação não concluída.",
    }),
  );

  assert.match(successMarkup, /feedback-banner feedback-banner--success/);
  assert.match(successMarkup, /role="status"/);
  assert.match(errorMarkup, /feedback-banner feedback-banner--error/);
  assert.match(errorMarkup, /role="alert"/);
});
