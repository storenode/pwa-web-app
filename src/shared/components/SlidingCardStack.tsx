import type { ReactNode } from "react";

interface SlidingCardStackProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic horizontally-scrollable, snap-scrolling row of joined/overlapping
 * daisyUI cards. Pass any array of card elements as children — this only
 * owns the sliding/overlap layout, not the card content itself.
 */
export default function SlidingCardStack({
  children,
  className = "",
}: SlidingCardStackProps) {
  return (
    <div className={`overflow-x-auto snap-x snap-mandatory ${className}`}>
      <div className="join rounded-selector w-max">{children}</div>
    </div>
  );
}
