"use client";
import { useState } from "react";
import type { QuizResponse } from "@/lib/quiz/contracts";
import { shareText } from "@/lib/client/share";
export function ShareResult({ game }: { game: QuizResponse }) {
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState(false);
  const text = shareText(game);
  async function share() {
    const full = `${text}\n${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: full });
        setMessage("Tulos jaettu.");
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(full);
      setMessage("Tulos kopioitu. Liitä se haluamaasi paikkaan.");
    } catch {
      setManual(true);
      setMessage("Voit kopioida tuloksen alla olevasta kentästä.");
    }
  }
  return (
    <div className="share-block">
      <button className="button button-primary" onClick={share}>
        Jaa tulos <span aria-hidden="true">↗</span>
      </button>
      <p className="muted small">Vain pisteet. Vastaukset pysyvät salassa.</p>
      <p className="small" role="status">
        {message}
      </p>
      {manual && (
        <label className="manual-share">
          Kopioitava tulos
          <textarea
            readOnly
            value={`${text}\n${typeof window === "undefined" ? "" : window.location.origin}`}
            onFocus={(e) => e.target.select()}
            rows={6}
          />
        </label>
      )}
    </div>
  );
}
