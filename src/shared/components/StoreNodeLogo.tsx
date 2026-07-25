interface StoreNodeLogoProps {
  className?: string;
  iconClassName?: string;
  subtitle?: string;
}

export function StoreNodeLogo({
  className = "",
  iconClassName = "",
  subtitle,
}: StoreNodeLogoProps) {
  return (
    <div
      className={`flex flex-row items-center gap-2 sm:gap-3 min-w-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] ${className}`}
    >
      <svg
        viewBox="280 30 120 104"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="StoreNode — store operating system"
        className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 ${iconClassName}`}
      >
        {/* Node dot at the roof peak */}
        <circle cx="340" cy="38" r="6" className="fill-success" />
        <circle
          cx="340"
          cy="38"
          r="11"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Striped awning */}
        <path
          d="M284 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
          className="fill-success"
          opacity="0.9"
        />
        <path
          d="M306.4 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
          className="fill-primary"
          opacity="0.9"
        />
        <path
          d="M328.8 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
          className="fill-success"
          opacity="0.9"
        />
        <path
          d="M351.2 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
          className="fill-primary"
          opacity="0.9"
        />
        <path
          d="M373.6 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
          className="fill-success"
          opacity="0.9"
        />
        <path
          d="M282 56 q0 -6 6 -6 h104 q6 0 6 6"
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Storefront body */}
        <path
          d="M292 80 v46 q0 4 4 4 h88 q4 0 4 -4 v-46"
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Door */}
        <rect
          x="326"
          y="102"
          width="28"
          height="28"
          rx="3"
          fill="none"
          className="stroke-success"
          strokeWidth="2.5"
        />
        <circle cx="348" cy="117" r="2.5" className="fill-success" />

        {/* Windows */}
        <rect
          x="300"
          y="102"
          width="17"
          height="13"
          rx="2"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          opacity="0.6"
        />
        <rect
          x="363"
          y="102"
          width="17"
          height="13"
          rx="2"
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          opacity="0.6"
        />
      </svg>
      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className="text-primary truncate"
          style={{
            fontFamily: "'Dancing Script', 'Segoe Script', cursive",
            fontSize: "22px",
            fontWeight: 400,
          }}
        >
          StoreNode
        </span>
        {subtitle && (
          <span
            className="text-base-content/60 truncate -mt-1"
            style={{
              fontFamily: "'Dancing Script', 'Segoe Script', cursive",
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
