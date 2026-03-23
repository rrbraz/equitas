type PageLoadingStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  blocks?: number;
};

export function PageLoadingState({
  eyebrow,
  title,
  description,
  blocks = 3,
}: PageLoadingStateProps) {
  return (
    <div className="screen-shell">
      <main className="page-content page-content--loading">
        <section className="state-card state-card--loading">
          <span className="section-label">{eyebrow}</span>
          <div className="state-card__copy">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="loading-stack">
            <div className="skeleton skeleton--line skeleton--line-lg" />
            <div className="skeleton skeleton--line skeleton--line-md" />
          </div>
        </section>

        {Array.from({ length: blocks }).map((_, index) => (
          <section key={index} className="loading-card">
            <div className="loading-stack">
              <div className="skeleton skeleton--line skeleton--line-sm" />
              <div className="skeleton skeleton--line skeleton--line-lg" />
            </div>
            <div className="loading-list">
              <div className="skeleton skeleton--row" />
              <div className="skeleton skeleton--row" />
              <div className="skeleton skeleton--row skeleton--row-short" />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
