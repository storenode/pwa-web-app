/**
 * Subtle repeating pattern of generic social/marketing glyphs — a camera
 * (posts), a chat bubble (reviews), a star (ratings), and a share arrow —
 * drawn as simple line icons (not brand marks) so it reads as "social media
 * activity" without reproducing any trademarked logo. Rendered with
 * `currentColor` so callers control tint/opacity via text-color classes.
 */
export function SocialIconsPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern
          id="storenode-social-icons"
          x="0"
          y="0"
          width="220"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          {/* camera / post icon */}
          <g transform="translate(20,30)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="0" y="6" width="34" height="26" rx="6" />
            <rect x="10" y="0" width="14" height="7" rx="2" />
            <circle cx="17" cy="19" r="8" />
          </g>

          {/* chat bubble / review */}
          <g transform="translate(120,20)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M0 6 a6 6 0 0 1 6 -6 h26 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-18 l-10 9 v-9 h-2 a6 6 0 0 1 -6 -6 z" />
          </g>

          {/* star / rating */}
          <g transform="translate(50,110)" fill="currentColor">
            <path d="M14 0 L17.5 9 L27 9.5 L19.5 15.5 L22 25 L14 19.5 L6 25 L8.5 15.5 L1 9.5 L10.5 9 Z" />
          </g>

          {/* share arrow / distribution */}
          <g transform="translate(150,120)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="4" cy="14" r="4" />
            <circle cx="24" cy="4" r="4" />
            <circle cx="24" cy="24" r="4" />
            <line x1="7.5" y1="12" x2="20.5" y2="6" />
            <line x1="7.5" y1="16" x2="20.5" y2="22" />
          </g>

          {/* small chat bubble, second cluster */}
          <g transform="translate(20,150)" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M0 5 a5 5 0 0 1 5 -5 h20 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-13 l-8 7 v-7 h-1 a5 5 0 0 1 -5 -5 z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#storenode-social-icons)" />
    </svg>
  );
}
