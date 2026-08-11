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
  {
    slug: "supplier-invoice-receiving",
    version: "",
    // Invoice capture (Claude Vision extraction), the receivables check
    // table, and the inventory ledger join are specced but not yet built.
    // Flip to "released" + set `version` in the same commit as the git tag
    // once this ships to real stores.
    status: "planned",
    title:
      "Turn a photographed supplier invoice into verified, counted stock — without retyping a single line item",
    tags: ["Inventory", "Purchasing", "Suppliers", "Stock Receiving", "GRN"],
    problem:
      "Bulk buying trips are where retail inventory actually starts, but they're also where the paper trail falls apart. An owner visits manufacturing units in another state, buys on the spot, and comes home with a stack of photographed invoices — some proforma, some final tax invoices, none of them raised through the store's own system. Line items get retyped into a spreadsheet by hand, if at all. Nobody checks the boxes against the invoice when they arrive — shortages, wrong sizes, and damaged pieces only surface weeks later when a store counter runs out of something it was supposed to have.",
    story:
      "UnFold Streetwear's owner spends two days visiting garment units out of state, buying stock on the spot for the next season. Each supplier hands over their own invoice on the way out — one a proforma requiring payment before dispatch, another a finished tax invoice already marked prepaid. Back at the corporate office, the admin photographs each invoice on their phone and uploads it to StoreNode. The supplier, the line items, the sizes, and the totals are all read off the page automatically — no retyping. A few days later, the shipment arrives. The store manager pulls up the matching check table on a tablet, opens each box, and counts: this line matches, this one's two units short, and this bundled line of \"4 models\" actually needs splitting into the four separate sizes that showed up. Once every row is resolved, they submit — and the counted stock, not the invoice's stated stock, is what lands in inventory.",
    resolution:
      "StoreNode turns a photographed supplier invoice into verified, counted inventory in two phases. Uploading the photo triggers Claude Vision extraction, which auto-populates the supplier record (matching or creating it), the invoice header, and every line item — no manual data entry. Once the admin confirms the extraction looks right and the shipment is marked dispatched, StoreNode generates a receivables check table: one row per invoice line, ready for physical verification. The store manager counts what's actually in the boxes, corrects quantities, flags shortages or damage, and — where an invoice bundled several sizes into one line — splits it into the real counted variants. Only once every row is resolved and submitted does stock join node inventory, with the invoice automatically marked delivered.",
    benefits: [
      "Cuts invoice data entry to a phone photo — supplier, line items, and totals are extracted automatically instead of retyped.",
      "Nothing joins inventory until someone has physically counted it — the invoice states what was billed, the check table states what actually arrived.",
      "Bundled invoice lines (multiple sizes billed as one line) can be split into the real counted variants during verification, so inventory reflects reality even when the supplier's paperwork doesn't.",
      "Shortages, excess, and damage get recorded at the moment of receiving, not discovered weeks later when a store runs out of stock.",
      "Every inventory addition traces back to a specific invoice and a specific person who counted it — a real audit trail instead of a spreadsheet retyped from memory.",
      "Suppliers get created automatically the first time their invoice is uploaded — no separate setup step before the first purchase can be recorded.",
    ],
    quotes: [
      {
        quote:
          "I used to hand my accountant a stack of photos and hope they typed it right. Now I just upload the photo myself and it's already there.",
        attribution: "Store owner, UnFold Streetwear",
      },
      {
        quote:
          "The invoice said one line, four models. What showed up was four different boxes. Being able to split that into what I actually counted is the whole point.",
        attribution: "Store manager, on the receivables check",
      },
      {
        quote:
          "We used to find out we were short a size two weeks later, at the counter, in front of a customer. Now we know the day the box is opened.",
        attribution: "Store owner, UnFold Streetwear",
      },
    ],
    demoVideoUrl: null,
    e2eSpec: null,
  },
];
