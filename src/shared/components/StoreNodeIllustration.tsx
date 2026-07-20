export default function StoreNodeIllustration() {
  return (
    <svg
      width="100%"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className="
        w-full
        md:w-[420px] md:h-[420px]
        lg:w-[500px] lg:h-[500px]
        rounded-2xl
      "
      role="img"
      aria-label="StoreNode illustration — campaigns, customers and stock for retail stores"
    >
      {/* main card */}
      <rect x="60" y="160" width="380" height="260" rx="20" fill="#ECFDF5" />
      <rect x="60" y="160" width="380" height="56" rx="20" fill="#10B981" />
      <rect x="60" y="196" width="380" height="24" fill="#10B981" />

      {/* window dots */}
      <circle cx="85" cy="188" r="8" fill="#34D399" />
      <circle cx="110" cy="188" r="8" fill="#6EE7B7" />
      <circle cx="135" cy="188" r="8" fill="#A7F3D0" />

      {/* Campaigns card */}
      <rect x="80" y="232" width="100" height="80" rx="12" fill="#EEF2FF" />
      <rect x="80" y="232" width="100" height="24" rx="8" fill="#667EEA" />
      <rect x="80" y="248" width="100" height="8" fill="#667EEA" />
      <text
        x="130"
        y="244"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="white"
      >
        📣 Campaigns
      </text>
      {/* mini instagram-style post */}
      <rect x="92" y="262" width="34" height="34" rx="6" fill="#C7D2FE" />
      <text x="109" y="284" textAnchor="middle" fontSize="14">
        👖
      </text>
      <rect x="132" y="264" width="40" height="7" rx="3" fill="#C7D2FE" />
      <rect x="132" y="276" width="32" height="7" rx="3" fill="#C7D2FE" />
      <rect x="132" y="288" width="36" height="7" rx="3" fill="#818CF8" />
      <text x="98" y="308" fontSize="9">
        ❤️
      </text>
      <text x="112" y="308" fontSize="9">
        💬
      </text>
      <rect x="128" y="300" width="44" height="6" rx="3" fill="#C7D2FE" />

      {/* Customers card */}
      <rect x="200" y="232" width="100" height="80" rx="12" fill="#D1FAE5" />
      <rect x="200" y="232" width="100" height="24" rx="8" fill="#10B981" />
      <rect x="200" y="248" width="100" height="8" fill="#10B981" />
      <text
        x="250"
        y="244"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="white"
      >
        ⭐ Customers
      </text>
      {/* review stars + coupon */}
      <text x="250" y="278" textAnchor="middle" fontSize="12" letterSpacing="1">
        ⭐⭐⭐⭐⭐
      </text>
      <rect x="214" y="288" width="72" height="18" rx="9" fill="#6EE7B7" />
      <text
        x="250"
        y="300"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8.5"
        fontWeight="700"
        fill="#065F46"
      >
        ₹100 COUPON
      </text>

      {/* Stock card */}
      <rect x="320" y="232" width="100" height="80" rx="12" fill="#FEF3C7" />
      <rect x="320" y="232" width="100" height="24" rx="8" fill="#F59E0B" />
      <rect x="320" y="248" width="100" height="8" fill="#F59E0B" />
      <text
        x="370"
        y="244"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="white"
      >
        📦 Stock
      </text>
      {/* boxes + trend to stores */}
      <rect x="334" y="264" width="18" height="18" rx="3" fill="#FDE68A" />
      <rect x="356" y="264" width="18" height="18" rx="3" fill="#FDE68A" />
      <rect x="378" y="264" width="18" height="18" rx="3" fill="#FDE68A" />
      <path
        d="M340 300 L364 292 L388 298"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="340" cy="300" r="3" fill="#F59E0B" />
      <circle cx="364" cy="292" r="3" fill="#F59E0B" />
      <circle cx="388" cy="298" r="3" fill="#F59E0B" />

      {/* timeline row */}
      <rect x="80" y="332" width="340" height="70" rx="12" fill="white" />
      <text
        x="100"
        y="352"
        fontFamily="Inter,sans-serif"
        fontSize="10"
        fontWeight="600"
        fill="#334155"
      >
        Today across your stores
      </text>

      <rect x="100" y="360" width="4" height="32" rx="2" fill="#F59E0B" />
      <rect x="112" y="360" width="92" height="14" rx="4" fill="#FEF3C7" />
      <text
        x="158"
        y="370"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8"
        fill="#92400E"
      >
        10AM — 64 pcs received
      </text>
      <rect x="112" y="378" width="84" height="10" rx="3" fill="#FDE68A" />
      <text
        x="154"
        y="386"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="7.5"
        fill="#92400E"
      >
        Godown → 4 stores
      </text>

      <rect x="216" y="360" width="4" height="32" rx="2" fill="#667EEA" />
      <rect x="228" y="360" width="96" height="14" rx="4" fill="#EEF2FF" />
      <text
        x="276"
        y="370"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8"
        fill="#3730A3"
      >
        12PM — Post approved ✓
      </text>
      <rect x="228" y="378" width="88" height="10" rx="3" fill="#C7D2FE" />
      <text
        x="272"
        y="386"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="7.5"
        fill="#4338CA"
      >
        Live on Instagram + FB
      </text>

      <rect x="336" y="360" width="4" height="32" rx="2" fill="#10B981" />
      <rect x="348" y="360" width="64" height="14" rx="4" fill="#D1FAE5" />
      <text
        x="380"
        y="370"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8"
        fill="#065F46"
      >
        6PM — 9 reviews ⭐
      </text>
      <rect x="348" y="378" width="70" height="10" rx="3" fill="#A7F3D0" />
      <text
        x="383"
        y="386"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="7.5"
        fill="#065F46"
      >
        12 coupons redeemed
      </text>

      {/* QR feedback phone widget (replaces calendar) */}
      <circle cx="250" cy="108" r="62" fill="#667EEA" opacity="0.08" />
      <circle cx="250" cy="108" r="46" fill="#667EEA" opacity="0.12" />
      <rect x="204" y="48" width="92" height="118" rx="14" fill="white" />
      <rect x="204" y="48" width="92" height="24" rx="10" fill="#667EEA" />
      <rect x="204" y="62" width="92" height="10" fill="#667EEA" />
      <text
        x="250"
        y="64"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8.5"
        fontWeight="600"
        fill="white"
      >
        Scan · Review · Save
      </text>
      {/* QR code */}
      <rect x="222" y="82" width="56" height="56" rx="4" fill="#EEF2FF" />
      {/* corner finders */}
      <rect x="227" y="87" width="12" height="12" fill="#334155" />
      <rect x="230" y="90" width="6" height="6" fill="#EEF2FF" />
      <rect x="261" y="87" width="12" height="12" fill="#334155" />
      <rect x="264" y="90" width="6" height="6" fill="#EEF2FF" />
      <rect x="227" y="121" width="12" height="12" fill="#334155" />
      <rect x="230" y="124" width="6" height="6" fill="#EEF2FF" />
      {/* qr modules */}
      <rect x="245" y="88" width="5" height="5" fill="#334155" />
      <rect x="252" y="94" width="5" height="5" fill="#334155" />
      <rect x="245" y="101" width="5" height="5" fill="#334155" />
      <rect x="258" y="104" width="5" height="5" fill="#334155" />
      <rect x="264" y="112" width="5" height="5" fill="#334155" />
      <rect x="252" y="112" width="5" height="5" fill="#334155" />
      <rect x="245" y="119" width="5" height="5" fill="#334155" />
      <rect x="258" y="124" width="5" height="5" fill="#334155" />
      <rect x="266" y="126" width="5" height="5" fill="#334155" />
      <text
        x="250"
        y="154"
        textAnchor="middle"
        fontFamily="Inter,sans-serif"
        fontSize="8"
        fontWeight="600"
        fill="#10B981"
      >
        ₹100 off next visit 🎉
      </text>

      {/* avatar left — merchant */}
      <circle cx="108" cy="88" r="28" fill="#FEF3C7" />
      <circle cx="108" cy="76" r="10" fill="#FDE68A" />
      <path
        d="M93 100 Q108 88 123 100 L123 116 Q108 108 93 116Z"
        fill="#FDE68A"
      />
      <circle cx="104" cy="74" r="2" fill="#92400E" />
      <circle cx="112" cy="74" r="2" fill="#92400E" />
      <path
        d="M103 80 Q108 84 113 80"
        fill="none"
        stroke="#92400E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="88"
        y="108"
        width="40"
        height="4"
        rx="2"
        fill="#F59E0B"
        opacity="0.4"
      />

      {/* avatar right — happy customer with shopping bag */}
      <circle cx="392" cy="88" r="28" fill="#D1FAE5" />
      <circle cx="392" cy="76" r="10" fill="#6EE7B7" />
      <path
        d="M377 100 Q392 88 407 100 L407 116 Q392 108 377 116Z"
        fill="#6EE7B7"
      />
      <circle cx="388" cy="74" r="2" fill="#065F46" />
      <circle cx="396" cy="74" r="2" fill="#065F46" />
      <path
        d="M387 80 Q392 84 397 80"
        fill="none"
        stroke="#065F46"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="372"
        y="108"
        width="40"
        height="4"
        rx="2"
        fill="#10B981"
        opacity="0.4"
      />

      {/* floating icons */}
      <circle cx="152" cy="52" r="14" fill="#EEF2FF" />
      <text x="152" y="57" textAnchor="middle" fontSize="14">
        📣
      </text>
      <circle cx="348" cy="52" r="14" fill="#ECFDF5" />
      <text x="348" y="57" textAnchor="middle" fontSize="14">
        🧵
      </text>
      <circle cx="80" cy="148" r="12" fill="#FEF3C7" />
      <text x="80" y="153" textAnchor="middle" fontSize="12">
        📦
      </text>
      <circle cx="420" cy="148" r="12" fill="#EEF2FF" />
      <text x="420" y="153" textAnchor="middle" fontSize="12">
        ⭐
      </text>

      {/* branding */}
      <text
        x="250"
        y="206"
        textAnchor="middle"
        fontFamily="'Dancing Script',cursive"
        fontSize="16"
        fontWeight="700"
        fill="#fff"
      >
        StoreNode · runs the business behind the counter
      </text>
    </svg>
  );
}
