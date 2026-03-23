import Link from "next/link";
import { Apple, ArrowRight, Chrome } from "lucide-react";

export function SignUpScreen() {
  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Join the atelier.</p>
        <h1 className="auth-headline">
          Clareza financeira para grupos elegantes.
        </h1>
        <p className="auth-subcopy">
          Crie sua conta, organize despesas compartilhadas e leve o backend para
          o Supabase desde o primeiro deploy.
        </p>
      </div>

      <section className="auth-panel">
        <div className="form-stack">
          <label>
            <span className="field-label">Nome completo</span>
            <input className="input-plain" placeholder="Ex.: Julian Smith" />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input
              className="input-plain"
              placeholder="name@example.com"
              type="email"
            />
          </label>
          <label>
            <span className="field-label">Senha</span>
            <input
              className="input-plain"
              placeholder="Min. 8 caracteres"
              type="password"
            />
          </label>
        </div>

        <Link href="/dashboard" className="primary-button primary-button--full">
          Criar conta
          <ArrowRight size={18} />
        </Link>

        <div className="center-divider">ou continue com</div>

        <div className="social-grid">
          <button className="social-button" type="button">
            <Chrome size={18} />
            Google
          </button>
          <button className="social-button" type="button">
            <Apple size={18} />
            Apple
          </button>
        </div>

        <p className="mono-caption">
          Já tem conta?{" "}
          <Link href="/dashboard" className="inline-link">
            Entrar no app
          </Link>
        </p>
      </section>

      <div className="footer-links">
        <span>Privacidade</span>
        <span>Termos</span>
        <span>Segurança</span>
      </div>
    </div>
  );
}
