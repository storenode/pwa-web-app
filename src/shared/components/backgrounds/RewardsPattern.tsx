/**
 * Subtle repeating pattern of reward/loyalty glyphs — a phone (scan the QR),
 * a star (rating earned), a coin (points), and a gift (redeemed reward) —
 * drawn as simple line icons so it reads as "loyalty rewards" without any
 * brand marks. Rendered with `currentColor` so callers control tint/opacity
 * via text-color classes, matching SocialIconsPattern/ThreadLines.
 */
export function RewardsPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern
          id="storenode-rewards-icons"
          x="0"
          y="0"
          width="220"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          {/* phone / QR scan */}
          <g transform="translate(20,20)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="0" y="0" width="24" height="40" rx="5" />
            <line x1="0" y1="32" x2="24" y2="32" />
            <circle cx="12" cy="36" r="1.5" fill="currentColor" stroke="none" />
          </g>

          {/* star / points earned */}
          <g transform="translate(130,15)" fill="currentColor">
            <path d="M14 0 L17.5 9 L27 9.5 L19.5 15.5 L22 25 L14 19.5 L6 25 L8.5 15.5 L1 9.5 L10.5 9 Z" />
          </g>

          {/* coin / redeemable value */}
          <g transform="translate(150,110)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="16" cy="16" r="16" />
            <text
              x="16"
              y="21"
              textAnchor="middle"
              fontSize="16"
              fill="currentColor"
              stroke="none"
              fontFamily="sans-serif"
            >
              ₹
            </text>
          </g>

          {/* gift / claimed reward */}
          <g transform="translate(30,130)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="0" y="12" width="34" height="22" rx="3" />
            <line x1="0" y1="20" x2="34" y2="20" />
            <line x1="17" y1="12" x2="17" y2="34" />
            <path d="M17 12 C10 12 8 2 17 2 C26 2 24 12 17 12 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#storenode-rewards-icons)" />
    </svg>
  );
}
