export function LogoLight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="70 20 540 232"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="StoreNode — store operating system"
      className={`text-base-content ${className}`}
    >
      {/* Decorative orbit rings around the storefront */}
      <circle
        cx="340"
        cy="88"
        r="62"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.3"
      />
      <circle
        cx="340"
        cy="88"
        r="46"
        fill="none"
        stroke="#667EEA"
        strokeWidth="2"
        strokeDasharray="3 8"
        opacity="0.35"
      />

      {/* Connector lines + nodes */}
      <line
        x1="80"
        y1="88"
        x2="258"
        y2="88"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <line
        x1="422"
        y1="88"
        x2="600"
        y2="88"
        stroke="#667EEA"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <circle cx="80" cy="88" r="5" fill="#10B981" opacity="0.5" />
      <circle cx="600" cy="88" r="5" fill="#667EEA" opacity="0.5" />
      <circle cx="258" cy="88" r="3.5" fill="#10B981" opacity="0.7" />
      <circle cx="422" cy="88" r="3.5" fill="#667EEA" opacity="0.7" />

      {/* Node dot at the roof peak */}
      <circle cx="340" cy="38" r="6" fill="#10B981" />
      <circle
        cx="340"
        cy="38"
        r="11"
        fill="none"
        stroke="#667EEA"
        strokeWidth="2"
        opacity="0.4"
      />

      {/* Striped awning */}
      <path
        d="M284 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
        fill="#10B981"
        opacity="0.9"
      />
      <path
        d="M306.4 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
        fill="#667EEA"
        opacity="0.9"
      />
      <path
        d="M328.8 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
        fill="#10B981"
        opacity="0.9"
      />
      <path
        d="M351.2 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
        fill="#667EEA"
        opacity="0.9"
      />
      <path
        d="M373.6 56 h22.4 v16 a11.2 8 0 0 1 -22.4 0 z"
        fill="#10B981"
        opacity="0.9"
      />
      <path
        d="M282 56 q0 -6 6 -6 h104 q6 0 6 6"
        fill="none"
        stroke="#667EEA"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Storefront body */}
      <path
        d="M292 80 v46 q0 4 4 4 h88 q4 0 4 -4 v-46"
        fill="none"
        stroke="#667EEA"
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
        stroke="#10B981"
        strokeWidth="2.5"
      />
      <circle cx="348" cy="117" r="2.5" fill="#10B981" />

      {/* Windows */}
      <rect
        x="300"
        y="102"
        width="17"
        height="13"
        rx="2"
        fill="none"
        stroke="#667EEA"
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
        stroke="#667EEA"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Wordmark */}
      <text
        x="340"
        y="202"
        textAnchor="middle"
        dx="-102"
        fill="#10B981"
        fontFamily="'Dancing Script', 'Segoe Script', cursive"
        fontSize="80"
        fontWeight="700"
      >
        Store
      </text>
      <text
        x="340"
        y="202"
        textAnchor="middle"
        dx="92"
        fill="#667EEA"
        fontFamily="'Dancing Script', 'Segoe Script', cursive"
        fontSize="80"
        fontWeight="700"
      >
        Node
      </text>

      {/* Tagline — inherits base-content so it flips with the DaisyUI theme */}
      <line
        x1="212"
        y1="232"
        x2="262"
        y2="232"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <line
        x1="418"
        y1="232"
        x2="468"
        y2="232"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <text
        x="340"
        y="240"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.65"
        fontFamily="'Dancing Script', 'Segoe Script', cursive"
        fontSize="22"
        fontWeight="400"
      >
        store operating system
      </text>
    </svg>
  );
}
