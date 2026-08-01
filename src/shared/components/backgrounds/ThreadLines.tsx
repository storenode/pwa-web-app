/**
 * Subtle woven cotton-thread texture — two sets of fine crossing lines,
 * rendered with `currentColor` so callers control tint/opacity via
 * text-color classes (e.g. `text-base-content/[0.05] dark:text-base-content/[0.08]`).
 */
export function ThreadLines({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern
          id="storenode-thread-lines"
          x="0"
          y="0"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          <path
            d="M0 12 Q12 8 24 12 T48 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M0 36 Q12 32 24 36 T48 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M12 0 Q8 12 12 24 T12 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M36 0 Q32 12 36 24 T36 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#storenode-thread-lines)" />
    </svg>
  );
}
