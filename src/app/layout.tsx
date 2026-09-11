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
    "Seitsemän kysymystä. Avara maailma. Pelaa suomalainen päivän yleistietovisa, opi uutta ja jaa tuloksesi.",
  applicationName: "Mylvisa",
  openGraph: {
    title: "Mylvisa – Pieni visa. Avara maailma.",
    description:
      "Seitsemän kysymystä joka päivä. Kuinka pitkälle uteliaisuutesi vie?",
    locale: "fi_FI",
    type: "website",
  },
};
export const viewport: Viewport = { themeColor: "#f5f3eb" };
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
