import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIFO cost basis — WAX educational example",
  description:
    "Client-side First-In, First-Out matching for WAX trade ledgers. Educational reference, not tax advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
