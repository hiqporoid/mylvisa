"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="fallback">
      <p className="eyebrow">MYLVISA</p>
      <h1>Hetkinen, ajatus katkesi.</h1>
      <p>Visan lataaminen ei onnistunut. Kokeillaan uudelleen.</p>
      <button className="button button-primary" onClick={reset}>
        Yritä uudelleen
      </button>
    </main>
  );
}
