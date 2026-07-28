import { Link } from "react-router-dom";
import { SocialIconsPattern } from "../../../shared/components/backgrounds/SocialIconsPattern";
import { ThreadLines } from "../../../shared/components/backgrounds/ThreadLines";
import StoreNodeIllustration from "../../../shared/components/StoreNodeIllustration";
import GoogleLoginButton from "../../../shared/fields/GoogleLogin.Button";
import { scenarios } from "../scenarios/getAllScenarios";

const chips = [
  {
    label: "AI Campaigns",
    bg: "bg-indigo-50 dark:bg-indigo-900/40",
    text: "text-indigo-800 dark:text-indigo-300",
  },
  {
    label: "QR Reviews & Coupons",
    bg: "bg-emerald-50 dark:bg-emerald-900/40",
    text: "text-emerald-800 dark:text-emerald-300",
  },
  {
    label: "Customer List",
    bg: "bg-amber-50 dark:bg-amber-900/40",
    text: "text-amber-800 dark:text-amber-300",
  },
  {
    label: "Stock & Distribution",
    bg: "bg-teal-50 dark:bg-teal-900/40",
    text: "text-teal-800 dark:text-teal-300",
  },
  { label: "Works with your POS", bg: "bg-surface", text: "text-text-muted" },
];

const pillars = [
  {
    emoji: "📣",
    title: "AI Campaigns",
    status: "live" as const,
    body: "Upload photos of new stock, type two lines in Telugu or English — StoreNode's AI writes your Instagram and Facebook posts. You approve, it publishes. Nothing goes live without your OK.",
  },
  {
    emoji: "⭐",
    title: "QR Reviews & Customers",
    status: "live" as const,
    body: "A QR board at your billing counter. Customers scan, leave a review and photo, get a ₹100 coupon for their next visit — and you get their number, with consent, building a customer list you own.",
  },
  {
    emoji: "📦",
    title: "AI Stock Receiving",
    status: "soon" as const,
    body: "Photograph the manufacturer's bill; AI turns it into a checklist. Your team counts against it and every shortage is caught at the godown gate, not discovered months later.",
  },
  {
    emoji: "🚚",
    title: "Smart Distribution",
    status: "soon" as const,
    body: "Which store sells 32-size fast? Which colour moves in Tirupathi? StoreNode learns from your daily sales and suggests how to split new stock across stores.",
  },
  {
    emoji: "🪞",
    title: "Display Intelligence",
    status: "soon" as const,
    body: "What goes on the mannequin this week? StoreNode picks display pieces from what's new, what's slow, and what's festival-ready — and drafts the matching Instagram post.",
  },
];

const steps = [
  {
    title: "Sign in with Google",
    body: "No installation; works on the phones your team already has.",
  },
  {
    title: "We set up your store",
    body: "Your logo, your stores, your Instagram & Facebook connected, your QR board printed.",
  },
  {
    title: "Run your week from one screen",
    body: "Approve AI posts, watch reviews come in, redeem coupons at the counter by phone number.",
  },
];

const faqs = [
  {
    q: "Do I have to leave my billing software?",
    a: "No. StoreNode works alongside your POS. Your counter doesn't change at all.",
  },
  {
    q: "Who writes the posts — a bot?",
    a: "AI drafts them from your photos and your words; a human — you — approves every post before it goes live.",
  },
  {
    q: "Can customers see my data?",
    a: "No. Customers only see your public review page. Your sales, stock, and customer list are visible only to your team, store by store, role by role.",
  },
  {
    q: "What about WhatsApp marketing?",
    a: "Your WhatsApp Channel is supported today (free, assisted posting). Paid targeted WhatsApp campaigns are on the roadmap — with per-message costs shown transparently before you ever spend a rupee.",
  },
  {
    q: "I have only one store. Is this for me?",
    a: "Yes — one store gets the same AI campaigns, QR reviews, and customer list. Stock distribution features simply stay out of your way until you grow.",
  },
];

function StatusBadge({ status }: { status: "live" | "soon" }) {
  if (status === "live") {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
        LIVE
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      COMING SOON
    </span>
  );
}

/** A themed section with a faint decorative pattern behind its content. */
function TexturedSection({
  className = "",
  patternClassName = "text-text/[0.05] dark:text-text/[0.08]",
  Pattern = ThreadLines,
  children,
}: {
  className?: string;
  patternClassName?: string;
  Pattern?: (props: { className?: string }) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Pattern
        className={`pointer-events-none absolute inset-0 w-full h-full ${patternClassName}`}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Full-bleed photo section with a fixed background — the browser paints it in
 * place while the page scrolls over it, the classic CSS parallax technique —
 * plus a dark gradient scrim so light text stays legible over the photo.
 */
function ParallaxPhotoSection({
  image,
  className = "",
  children,
}: {
  image: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative bg-fixed bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/75 to-slate-950/45"
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero — fixed-background denim photo for a real scroll parallax
          effect. -mt-24 cancels the layout's header-offset padding so the
          photo sits directly under the transparent header. */}
      <ParallaxPhotoSection
        image="/images/denim-texture-cc0.webp"
        className="-mt-24"
      >
        <div className="container px-6 pt-32 pb-20 sm:pt-44 sm:pb-32 mx-auto">
          <div className="items-center lg:flex">
            <div className="w-full lg:w-1/2">
              <div className="lg:max-w-lg">
                <span className="inline-block text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                  StoreNode · Store Operating System
                </span>

                <h1 className="mt-4 text-4xl font-bold text-white lg:text-5xl leading-tight">
                  Your store's{" "}
                  <span className="text-emerald-400">marketing and stock</span>,
                  on autopilot.
                </h1>

                <p className="mt-5 text-slate-200">
                  Keep your billing machine. StoreNode runs everything behind
                  the counter — AI-made Instagram & Facebook posts, customer
                  reviews and coupons through a QR code, and stock that finally
                  matches the racks.
                </p>

                <p className="mt-2 text-slate-300">
                  మీ POS కౌంటర్ నడిపిస్తుంది. StoreNode మీ వ్యాపారాన్ని
                  నడిపిస్తుంది.
                </p>

                <div className="flex flex-wrap gap-2 mt-5">
                  {chips.map(({ label }) => (
                    <span
                      key={label}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-white/10 text-slate-100 ring-1 ring-white/15"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="w-full mt-8 flex flex-wrap items-center gap-4">
                  <GoogleLoginButton />
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-200 underline underline-offset-4 hover:text-white transition-colors"
                  >
                    Watch the 2-minute demo
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[420px] lg:w-[500px] flex-shrink-0 mt-12 lg:mt-0">
              <StoreNodeIllustration />
            </div>
          </div>
        </div>
      </ParallaxPhotoSection>

      {/* Scenarios teaser */}
      <div className="bg-bg">
        <div className="container px-20 py-20 sm:py-20 mx-auto max-w-full text-center">
          <span className="text-xs font-semibold tracking-wide uppercase text-emerald-600 dark:text-emerald-400">
            See it in action
          </span>
          <h2 className="mt-2 text-2xl font-bold text-text sm:text-3xl">
            See it solve a real store's problem
          </h2>
          <p className="mt-3 text-text-muted">
            Each scenario walks through a real problem, the story behind it, and
            how StoreNode resolves it — with a working demo.
          </p>

          {scenarios.length === 0 ? (
            <div className="mt-8 p-8 border border-dashed border-border rounded-2xl">
              <p className="text-text-muted">
                No scenarios published yet — we're recording the first ones now.
                Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 mt-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-left">
              {scenarios.map((scenario) => (
                <Link
                  key={scenario.slug}
                  to={`/scenarios/${scenario.slug}`}
                  className="p-6 border border-border rounded-2xl bg-surface hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                >
                  <h3 className="font-semibold text-text">{scenario.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {scenario.problem}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {scenario.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The problem */}
      <TexturedSection
        className="bg-surface py-16 sm:py-24"
        Pattern={SocialIconsPattern}
        patternClassName="text-indigo-500/[0.08] dark:text-indigo-300/[0.08]"
      >
        <div className="container px-6 mx-auto max-w-3xl text-center bg-base-100">
          <span className="text-xs font-semibold tracking-wide uppercase text-amber-600 dark:text-amber-400">
            The problem
          </span>
          <p className="mt-4 text-xl text-text leading-relaxed">
            Your best salesperson can't also be your marketing team. New stock
            reaches the racks, but never reaches Instagram. Customers love the
            store, but their numbers stay in the billing machine. The godown
            Excel says one number, the shelf says another.
          </p>
          <p className="mt-6 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            StoreNode fixes the business behind the counter — without touching
            your billing.
          </p>
        </div>
      </TexturedSection>

      {/* Five pillars */}
      <div className="container px-6 py-16 mx-auto">
        <h2 className="text-2xl font-semibold text-center text-text">
          Everything behind the counter, in one place
        </h2>

        <div className="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="p-6 border border-border rounded-2xl bg-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{pillar.emoji}</span>
                <StatusBadge status={pillar.status} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-text">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-bg">
        <div className="container px-6 py-16 mx-auto">
          <h2 className="text-2xl font-semibold text-center text-text">
            How it works
          </h2>

          <div className="grid gap-8 mt-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white font-semibold">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positioning strip */}
      <div className="bg-emerald-600 dark:bg-emerald-700">
        <div className="container px-6 py-10 mx-auto text-center">
          <p className="text-xl font-semibold text-white">
            The POS runs the counter. StoreNode runs the business behind the
            counter.
          </p>
          <p className="mt-1 text-sm text-emerald-50">
            No billing migration. No new hardware. Works alongside QueueBuster
            or any POS.
          </p>
        </div>

        <div className="border-t border-white/15">
          <div className="container grid grid-cols-2 gap-8 px-6 py-8 mx-auto text-center sm:grid-cols-4">
            {[
              { value: "2", label: "Live features today" },
              { value: "3", label: "Coming next" },
              { value: "₹5,000", label: "Flat, per month" },
              { value: "0", label: "Hidden fees" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-emerald-50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="container px-6 py-16 mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-semibold text-text">Pricing</h2>
        <p className="mt-6 text-4xl font-bold text-text">
          ₹5,000<span className="text-lg font-medium">/month</span>
        </p>
        <p className="mt-1 text-text-muted">per business</p>
        <p className="mt-4 text-text-muted">
          Includes 2 stores; +₹1,000 per additional store. AI campaign drafting
          included (fair-use). No per-message charges, no hidden fees. WhatsApp
          Channel posting assisted, free. Cancel anytime.
        </p>
        <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Early merchant offer: founding merchants keep this price for life.
        </p>
      </div>

      {/* Trust */}
      <div className="bg-bg">
        <div className="container px-6 py-14 mx-auto max-w-2xl text-center">
          <p className="text-text leading-relaxed">
            Built in Andhra Pradesh, for Indian textile retail. StoreNode was
            born inside a real 4-city clothing business — every feature exists
            because a real store needed it. Your data stays yours: customer
            numbers are collected with consent, and nothing ever posts to your
            pages without your approval.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="container px-6 py-16 mx-auto max-w-2xl">
        <h2 className="text-2xl font-semibold text-center text-text">
          Frequently asked questions
        </h2>

        <div className="mt-8 divide-y divide-border border-t border-b border-border">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-text">
                {faq.q}
                <span className="ml-4 text-text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
