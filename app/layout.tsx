import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Equitas",
  description:
    "Split bills, monitor balances and settle elegant group finances.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
