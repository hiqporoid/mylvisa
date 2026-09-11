import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
const manrope = localFont({
  src: "../../public/fonts/Manrope-Latin.woff2",
  variable: "--font-mylvisa",
  weight: "200 800",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Mylvisa – Päivän visa",
  description:
    "Seitsemän kysymystä, monta oikeaa vastausta. Löydä päivän harvinaisin oivallus.",
  applicationName: "Mylvisa",
  openGraph: {
    title: "Mylvisa – Löydä harvinainen vastaus",
    description:
      "Sama päiväpeli kaikille. Harvinaisemmasta oikeasta vastauksesta saat enemmän pisteitä.",
    locale: "fi_FI",
    type: "website",
  },
};
export const viewport: Viewport = { themeColor: "#101113" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#main">
          Siirry sisältöön
        </a>
        {children}
      </body>
    </html>
  );
}
