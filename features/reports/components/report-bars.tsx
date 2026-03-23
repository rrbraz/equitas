import type { MonthlyBalance } from "@/features/reports/types";

const toneClass = {
  muted: "report-bars__bar--muted",
  green: "report-bars__bar--green",
  rose: "report-bars__bar--rose",
  soft: "report-bars__bar--soft",
};

type ReportBarsProps = {
  items: MonthlyBalance[];
};

export function ReportBars({ items }: ReportBarsProps) {
  if (items.length === 0) {
    return null;
  }

  const peak = Math.max(...items.map((item) => Math.abs(item.value)));

  return (
    <div className="report-bars" aria-label="Panorama mensal">
      {items.map((item) => (
        <div key={item.month} className="report-bars__item">
          <div className="report-bars__track">
            <div
              className={`report-bars__bar ${toneClass[item.tone]}`}
              style={{
                height: `${peak === 0 ? 24 : Math.max(24, (Math.abs(item.value) / peak) * 100)}%`,
              }}
            />
          </div>
          <span className="report-bars__label">{item.month}</span>
        </div>
      ))}
    </div>
  );
}
