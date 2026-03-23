import Link from "next/link";
import { FolderSearch2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="screen-shell">
      <main className="page-content page-content--centered">
        <section className="state-card">
          <div className="state-card__icon">
            <FolderSearch2 size={24} />
          </div>
          <span className="section-label">Grupo não encontrado</span>
          <div className="state-card__copy">
            <h1>Este grupo não está disponível</h1>
            <p>
              O slug pode estar incorreto, o grupo pode ter sido removido ou
              você ainda não tem acesso a ele.
            </p>
          </div>
          <Link href="/grupos" className="primary-button primary-button--full">
            Voltar para grupos
          </Link>
        </section>
      </main>
    </div>
  );
}
