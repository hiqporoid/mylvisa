"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { MAX_MYLV, MYLVINTA_MILESTONES, mylvintaMilestone, progressionDuration } from "@/lib/quiz/progression";

function AnimatedNumber({ value, suffix = "", duration = 900 }: { value: number; suffix?: string; duration?: number }) {
  const previous = useRef(value);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);
  return <span>{shown}{suffix}</span>;
}

export const MylvintaWave = memo(function MylvintaWave({ points, pulsePoints = 0, active = false }: { points: number; pulsePoints?: number; active?: boolean }) {
  const mylv = points * 10;
  const milestone = mylvintaMilestone(mylv);
  const next = MYLVINTA_MILESTONES.find((item) => item.mylv > mylv);
  const duration = progressionDuration(pulsePoints || 10);
  const progress = Math.min(100, (mylv / MAX_MYLV) * 100);
  const style = {
    "--journey": `${progress}%`,
    "--travel": `${progress * -.42}%`,
    "--travel-duration": `${duration}ms`,
    "--pulse-scale": String(1 + Math.min(1.7, pulsePoints / 65)),
  } as CSSProperties;

  return (
    <figure className={`mylvinta-world ${active ? "is-pulsing" : ""}`} style={style} aria-label={`Mylvintäaalto: ${mylv} / ${MAX_MYLV} MYLV. ${milestone.label}.`}>
      <div className="mylvinta-sky" aria-hidden="true"><i className="star star-a" /><i className="star star-b" /><i className="moon" /></div>
      <div className="mylvinta-landscape" aria-hidden="true">
        <div className="forest forest-far" />
        <div className="town town-far"><i /><i /><i /><i /></div>
        <div className="radio-tower"><i /><i /><i /></div>
        <div className="town town-near"><i /><i /><i /></div>
        <div className="forest forest-near" />
        <div className="road-sign">MYLV</div>
      </div>
      <div className="mylvinta-emitter" aria-hidden="true">
        <i className="sound-ring ring-one" /><i className="sound-ring ring-two" /><i className="sound-ring ring-three" />
        <span className="mylvinta-head"><i /></span>
      </div>
      <figcaption className="mylvinta-caption">
        <span><b><AnimatedNumber value={mylv} duration={duration} /> MYLV</b><small>{milestone.label}</small></span>
        <span className="mylvinta-next">{next ? `Seuraava: ${next.label} · ${next.mylv} MYLV` : "Aalto on huipussaan"}</span>
      </figcaption>
      <div className="mylvinta-track" aria-hidden="true"><span /></div>
    </figure>
  );
});

export { AnimatedNumber };
