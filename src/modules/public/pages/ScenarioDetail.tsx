import { Link, useParams } from "react-router-dom";
import { scenarios } from "../scenarios/getAllScenarios";

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

export default function ScenarioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const scenario = scenarios.find((s) => s.slug === slug);

  if (!scenario) {
    return (
      <div className="container px-6 py-24 mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold text-base-content">Scenario not found</h1>
        <p className="mt-2 text-base-content/60">
          We couldn't find a scenario at "{slug}".
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
        <p className="mt-3 text-base-content leading-relaxed">{scenario.resolution}</p>
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
