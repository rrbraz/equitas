import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="screen-shell">
      <main className="page-content page-content--centered">
        <section className="state-card">
          <div className="state-card__icon">
            <SearchX size={24} />
          </div>
          <span className="section-label">Página não encontrada</span>
          <div className="state-card__copy">
            <h1>Esse caminho não existe mais</h1>
            <p>
              O link pode estar desatualizado ou o conteúdo ainda não foi criado
              neste ambiente.
            </p>
          </div>
          <Link href="/" className="primary-button primary-button--full">
            Voltar para entrada
          </Link>
        </section>
      </main>
    </div>
  );
}
