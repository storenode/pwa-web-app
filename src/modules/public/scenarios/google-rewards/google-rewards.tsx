import { Link } from "react-router-dom";
import { scenarios } from "../getAllScenarios";

/** This page is dedicated to exactly one scenario — no :slug route param needed. */
export const SLUG = "qr-review-reward";

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

const flowSteps = [
  {
    title: "Bill is closed at the counter",
    detail:
      "The front desk person finishes billing — say, ₹10,000 worth of clothes — on the POS your store already uses.",
  },
  {
    title: "The ask",
    detail:
      "\"Leave us a quick Google review and get 5% back as reward points\" — a 10-second line at the counter, every time.",
  },
  {
    title: "Scan the QR board",
    detail:
      "The customer points their phone camera at the QR board on the counter. No app to install — it just opens Chrome.",
  },
  {
    title: "Review, right there",
    detail:
      "Chrome opens the store's public Google review page. The customer rates and writes a line while it's still fresh.",
  },
  {
    title: "Reward points, logged automatically",
    detail:
      "StoreNode credits 5% of the bill as reward points against the customer's phone number — no manual entry by staff.",
  },
];

export default function GoogleRewardsScenario() {
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
          <span className="text-xs text-base-content/60">v{scenario.version}</span>
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
        <p className="mt-3 text-base-content leading-relaxed">{scenario.problem}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-indigo-600 dark:text-indigo-400">
          The story
        </h2>
        <p className="mt-3 text-base-content leading-relaxed">{scenario.story}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
          How StoreNode resolves it
        </h2>
        <p className="mt-3 text-base-content leading-relaxed">
          {scenario.resolution}
        </p>
      </section>

      {/* Working details specific to this scenario — the step-by-step flow
          and a worked reward example, developed independently of the
          generic scenario template. */}
      <section className="mt-12">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
          How it works, step by step
        </h2>
        <ol className="mt-4 space-y-4">
          {flowSteps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-base-content">{step.title}</p>
                <p className="mt-1 text-sm text-base-content/60">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 p-6 rounded-2xl border border-base-300 bg-base-100">
        <h2 className="text-xs font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
          Worked example
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-2 mt-3">
          <span className="text-2xl font-bold text-base-content">₹10,000</span>
          <span className="text-base-content/60">bill</span>
          <span className="text-base-content/60">×</span>
          <span className="text-2xl font-bold text-base-content">5%</span>
          <span className="text-base-content/60">=</span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            ₹500
          </span>
          <span className="text-base-content/60">in reward points</span>
        </div>
        <p className="mt-2 text-sm text-base-content/60">
          Credited automatically against the customer's phone number the
          moment their Google review is submitted — nothing for the front
          desk to type in.
        </p>
      </section>

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
