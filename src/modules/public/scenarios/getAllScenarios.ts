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
  /** Selling points for a retail store owner deciding whether to adopt this — concrete, not feature-list fluff. */
  benefits: string[];
  /** Short testimonial-style quotes (store owner / customer voice) reinforcing the story. */
  quotes: { quote: string; attribution: string }[];
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
    // Rewards (birthday + Google-review channel click), bill-based point
    // redemption, and voice reviews are all built and working end-to-end.
    // Flip to "released" + set `version` in the same commit as the git tag
    // once this ships to real stores.
    status: "in-progress",
    title: "Turn every counter visit into a review, a repeat customer, and a customer list you own",
    tags: [
      "Marketing",
      "Reviews",
      "Rewards",
      "Redemption",
      "Voice Reviews",
      "Customer List",
    ],
    problem:
      "Retail store owners know reviews and repeat visits are what actually grow the business — but there's no consistent, low-effort way to capture either at the one moment it's easiest: right at the billing counter, while the customer is still standing there, happy, bill in hand. Ask for a review with nothing in return and most customers won't bother. Run a loyalty scheme on paper punch cards and it gets lost, forgotten, or ignored by staff. And the store never ends up with a real customer list — just a drawer full of paper.",
    story:
      "A customer buys ₹10,000 worth of clothes at Nebula Threads. At the billing counter, the front desk person asks for a quick Google review in exchange for reward points worth 5% of the bill — ₹500. The customer scans the QR board at the counter with their phone camera, no app install, and lands on the store's own review page in Chrome. They leave a Google review right there, and the points land against their phone number instantly. Too busy to type a full review? They tap the mic instead and leave a 20-second voice review on the way out. Next visit, the same phone number pulls up ₹500 in unclaimed points — the front desk applies it straight to the new bill as a discount, no punch card, no spreadsheet, no manual math. On their birthday, the same phone number earns another set of points automatically, giving the store a natural reason to text them and bring them back in.",
    resolution:
      "StoreNode prints one QR board for the billing counter. Scanning it opens the store's public review page — nothing to install, just the phone's camera and Chrome. From there, a customer can leave a Google review, record a 20-second voice review, or come back later and redeem their running point balance against a new bill — all tied to their phone number, all logged automatically with no manual entry by staff. Store owners get a real, growing customer list they own outright, a birthday-reward touchpoint that brings people back on its own, and a redemption flow staff can run from the counter in seconds — the full loop from \"first review\" to \"repeat customer\" in one QR scan.",
    benefits: [
      "Turns a one-time buyer into a repeat customer — the reward balance itself is the reason they come back, and it's the store's own reminder, not a platform's.",
      "Builds a real, owned customer list (phone numbers, birthdays, purchase-linked rewards) instead of depending entirely on foot traffic or a third-party platform's audience.",
      "Costs the store nothing extra to run — 5% back in points is cheaper than most discount campaigns, and it's funded only when a customer actually engages.",
      "No new hardware or app for the customer — a printed QR board and the phone's own camera and browser are enough.",
      "Front desk staff get a simple, repeatable script (\"leave a review, get 5% back\") instead of an awkward, inconsistent ask.",
      "Voice reviews remove the biggest friction in getting a review at all — a customer who won't type two sentences will often talk for twenty seconds.",
      "Redemption and birthday rewards are tracked and applied automatically, so nothing depends on staff remembering a punch card or doing point math by hand.",
    ],
    quotes: [
      {
        quote:
          "Earlier we'd ask for a review and get nothing — now the front desk just points at the board and it happens on its own. The points bring them back for the next bill too.",
        attribution: "Store owner, Nebula Threads",
      },
      {
        quote:
          "I didn't want to type a review standing at the counter, so I just spoke it into the phone. Took me less time than paying the bill.",
        attribution: "Customer, on the voice review flow",
      },
      {
        quote:
          "Every other loyalty card I've had gets lost in a drawer. This is just my phone number — I don't have to carry anything or remember anything.",
        attribution: "Repeat customer, describing the redemption flow",
      },
    ],
    demoVideoUrl: null,
    e2eSpec: null,
  },
];
