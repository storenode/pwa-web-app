import { Link } from "react-router-dom";
import { scenarios } from "../getAllScenarios";

/** This page is dedicated to exactly one scenario — no :slug route param needed. */
export const SLUG = "supplier-invoice-receiving";

const statusLabel = {
  planned: "Planned",
  "in-progress": "In progress",
  released: "Released",
} as const;

const statusClass = {
  planned:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "in-progress":
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  released:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
} as const;

function InvoiceCaptureFlow() {
  return (
    <svg
      width="100%"
      viewBox="0 0 680 484"
      role="img"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      <title>Invoice capture and auto-populate flow</title>
      <desc>
        Admin scans and uploads an invoice, Claude Vision extracts the data,
        records are auto-populated, then an admin verifies the extracted
        data.
      </desc>
      <defs>
        <marker
          id="arrow1"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="#6b6b66"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <rect
        x="200"
        y="40"
        width="280"
        height="56"
        rx="8"
        fill="#FAEEDA"
        stroke="#854F0B"
        strokeWidth="1"
      />
      <text
        x="340"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#412402"
      >
        Scan &amp; upload invoice
      </text>
      <text
        x="340"
        y="76"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#854F0B"
      >
        Admin captures photo or PDF
      </text>

      <line
        x1="340"
        y1="96"
        x2="340"
        y2="156"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow1)"
      />

      <rect
        x="200"
        y="156"
        width="280"
        height="56"
        rx="8"
        fill="#E1F5EE"
        stroke="#0F6E56"
        strokeWidth="1"
      />
      <text
        x="340"
        y="174"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#04342C"
      >
        Claude Vision extraction
      </text>
      <text
        x="340"
        y="192"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#0F6E56"
      >
        Reads supplier and line items
      </text>

      <line
        x1="340"
        y1="212"
        x2="340"
        y2="272"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow1)"
      />

      <rect
        x="200"
        y="272"
        width="280"
        height="56"
        rx="8"
        fill="#E1F5EE"
        stroke="#0F6E56"
        strokeWidth="1"
      />
      <text
        x="340"
        y="290"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#04342C"
      >
        Auto-populate records
      </text>
      <text
        x="340"
        y="308"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#0F6E56"
      >
        Supplier, invoice, line items
      </text>

      <line
        x1="340"
        y1="328"
        x2="340"
        y2="388"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow1)"
      />

      <rect
        x="200"
        y="388"
        width="280"
        height="56"
        rx="8"
        fill="#FAEEDA"
        stroke="#854F0B"
        strokeWidth="1"
      />
      <text
        x="340"
        y="406"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#412402"
      >
        Verify extracted data
      </text>
      <text
        x="340"
        y="424"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#854F0B"
      >
        Admin confirms accuracy
      </text>
    </svg>
  );
}

function ReceivablesCheckFlow() {
  return (
    <svg
      width="100%"
      viewBox="0 0 680 484"
      role="img"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      <title>Receivables check to inventory flow</title>
      <desc>
        The check table is generated from the invoice, a manager physically
        counts stock and edits each row, submits the completed table, and
        stock joins node inventory.
      </desc>
      <defs>
        <marker
          id="arrow2"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="#6b6b66"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      <rect
        x="200"
        y="40"
        width="280"
        height="56"
        rx="8"
        fill="#E1F5EE"
        stroke="#0F6E56"
        strokeWidth="1"
      />
      <text
        x="340"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#04342C"
      >
        Check table generated
      </text>
      <text
        x="340"
        y="76"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#0F6E56"
      >
        One row per invoice line
      </text>

      <line
        x1="340"
        y1="96"
        x2="340"
        y2="156"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow2)"
      />

      <rect
        x="200"
        y="156"
        width="280"
        height="56"
        rx="8"
        fill="#FAEEDA"
        stroke="#854F0B"
        strokeWidth="1"
      />
      <text
        x="340"
        y="174"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#412402"
      >
        Count physical stock
      </text>
      <text
        x="340"
        y="192"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#854F0B"
      >
        Manager edits each row
      </text>

      <line
        x1="340"
        y1="212"
        x2="340"
        y2="272"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow2)"
      />

      <rect
        x="200"
        y="272"
        width="280"
        height="56"
        rx="8"
        fill="#FAEEDA"
        stroke="#854F0B"
        strokeWidth="1"
      />
      <text
        x="340"
        y="290"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#412402"
      >
        Submit check table
      </text>
      <text
        x="340"
        y="308"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#854F0B"
      >
        All rows resolved
      </text>

      <line
        x1="340"
        y1="328"
        x2="340"
        y2="388"
        stroke="#6b6b66"
        strokeWidth="1.5"
        markerEnd="url(#arrow2)"
      />

      <rect
        x="200"
        y="388"
        width="280"
        height="56"
        rx="8"
        fill="#E1F5EE"
        stroke="#0F6E56"
        strokeWidth="1"
      />
      <text
        x="340"
        y="406"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#04342C"
      >
        Stock joins inventory
      </text>
      <text
        x="340"
        y="424"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fill="#0F6E56"
      >
        Ledger entries created
      </text>
    </svg>
  );
}

export default function SupplierInvoiceReceivingScenario() {
  const scenario = scenarios.find((s) => s.slug === SLUG);

  if (!scenario) {
    return (
      <div className="container px-6 py-24 mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-base-content">
          Scenario not found
        </h1>
        <p className="mt-2 text-base-content/60">
          We couldn't find a scenario at "{SLUG}".
        </p>
        <Link
          to="/public/home"
          className="inline-block mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-6 py-16 sm:py-20 mx-auto max-w-3xl">
      <Link
        to="/public/home"
        className="text-sm font-medium text-base-content/60 hover:text-base-content underline underline-offset-4"
      >
        ← Back to home
      </Link>

      <div className="flex items-center gap-3 mt-6">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[scenario.status]}`}
        >
          {statusLabel[scenario.status]}
        </span>
        {scenario.version && (
          <span className="text-xs text-base-content/60">
            v{scenario.version}
          </span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-bold text-base-content leading-tight">
        {scenario.title}
      </h1>

      <div className="flex flex-wrap gap-2 mt-4">
        {scenario.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
          The problem
        </h2>
        <p className="mt-3 text-base-content leading-relaxed">
          {scenario.problem}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400">
          The story
        </h2>
        <p className="mt-3 text-base-content leading-relaxed">
          {scenario.story}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
          How StoreNode resolves it
        </h2>
        <p className="mt-3 text-base-content leading-relaxed">
          {scenario.resolution}
        </p>
      </section>

      {/* Two-phase flow diagram, specific to this scenario: capture happens
          well before receiving, so they're shown as separate flows rather
          than one combined step list. */}
      <section className="mt-12">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
          Phase 1 — capture the invoice
        </h2>
        <div className="mt-4 rounded-2xl border border-base-300 bg-base-100 p-4">
          <InvoiceCaptureFlow />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
          Phase 2 — receive and verify the stock
        </h2>
        <div className="mt-4 rounded-2xl border border-base-300 bg-base-100 p-4">
          <ReceivablesCheckFlow />
        </div>
      </section>

      {scenario.benefits.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
            Why store owners adopt this
          </h2>
          <ul className="mt-3 space-y-2">
            {scenario.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-2 text-base-content leading-relaxed"
              >
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {scenario.quotes.length > 0 && (
        <section className="mt-10 space-y-4">
          {scenario.quotes.map((q) => (
            <blockquote
              key={q.quote}
              className="border-l-4 border-emerald-300 dark:border-emerald-700 pl-4 italic text-base-content/80"
            >
              "{q.quote}"
              <footer className="mt-1 text-sm not-italic text-base-content/60">
                — {q.attribution}
              </footer>
            </blockquote>
          ))}
        </section>
      )}

      {scenario.demoVideoUrl && (
        <section className="mt-10">
          <a
            href={scenario.demoVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-emerald-700 dark:text-emerald-400 underline underline-offset-4"
          >
            Watch the demo →
          </a>
        </section>
      )}
    </div>
  );
}
