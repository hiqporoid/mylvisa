import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="fallback">
      <p className="eyebrow">404 · MYLVISA</p>
      <h1>Tämä jäi arvoitukseksi.</h1>
      <p>Etsimääsi sivua ei löytynyt. Päivän visa odottaa etusivulla.</p>
      <Link href="/" className="button button-primary">
        Päivän visaan ↗
      </Link>
    </main>
  );
}
