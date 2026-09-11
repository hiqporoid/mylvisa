export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 2v36M2 20h36M7.3 7.3l25.4 25.4M7.3 32.7 32.7 7.3"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="20" cy="20" r="7" fill="currentColor" />
    </svg>
  );
}
export function Arrow({ backwards = false }: { backwards?: boolean }) {
  return <span aria-hidden="true">{backwards ? "↶" : "↗"}</span>;
}
