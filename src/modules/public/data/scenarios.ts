export interface Scenario {
  /** URL slug — used in /scenarios/:slug and as the git tag suffix (scenario/<slug>-v<version>) */
  slug: string;
  /** Set by hand, in the same commit as the git tag, once the scenario ships */
  version: string;
  status: "planned" | "in-progress" | "released";
  title: string;
  /** Short topical labels for filtering/browsing, e.g. ["Marketing", "Reviews"] */
  tags: string[];
  /** (1) the pain point StoreNode solves */
  problem: string;
  /** (2) the narrative — a concrete story, not a feature list */
  story: string;
  /** (3) how StoreNode resolves it, in-product terms */
  resolution: string;
  demoVideoUrl: string | null;
  /** path to the Playwright spec covering this scenario, e.g. "e2e/scenarios/campaign-approval.spec.ts" */
  e2eSpec: string | null;
}

// This file is the single source of truth for both /scenarios and the home
// page teaser — update it by hand in the same commit as the scenario's git
// tag once it ships (see the `version` field on each entry).
export const scenarios: Scenario[] = [
  {
    slug: "qr-review-reward",
    version: "",
    status: "planned",
    title: "Earn reward points with a Google review",
    tags: ["Marketing", "Reviews", "Rewards", "Customer List"],
    problem:
      "Front desk staff know a happy customer is the best time to ask for a review — but there's no consistent, fast way to do it at the counter, and no reason for the customer to bother unless something comes back to them for it.",
    story:
      "A customer buys ₹10,000 worth of clothes. At the billing counter, the front desk person asks for a quick review in exchange for reward points worth 5% of the bill. The customer asks how — so the front desk person points to a QR code at the counter. The customer scans it with their phone, and it opens a page in Chrome where they leave a Google review right there at the counter.",
    resolution:
      "StoreNode prints a QR board for the billing counter. Scanning it opens the store's public review page — no app install, just the phone's camera and Chrome. Once the customer submits their Google review, StoreNode logs 5% of the bill as reward points against their phone number, building a customer list the store owns, one review at a time.",
    demoVideoUrl: null,
    e2eSpec: null,
  },
];
