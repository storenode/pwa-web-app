import ComponentCard from "./ComponentCard";

interface NavigableCardProps {
  title: string | null;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  onPrevClick?: () => void; // Called when the previous button is clicked
  onNextClick?: () => void; // Called when the next button is clicked
  isPrevDisabled?: boolean; // Disables the previous button (e.g. first item)
  isNextDisabled?: boolean; // Disables the next button (e.g. last item)
}

// Prev/Next nav buttons rendered in the card header, either side of the title
const NavButton = ({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    aria-label={direction === "prev" ? "Previous" : "Next"}
    onClick={onClick}
    disabled={disabled}
    className="btn btn-sm btn-circle btn-active btn-secondary disabled:opacity-30"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      {direction === "prev" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  </button>
);

// Wraps ComponentCard to add Prev/Next navigation buttons around the title in the card header
const NavigableCard: React.FC<NavigableCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  onPrevClick,
  onNextClick,
  isPrevDisabled = false,
  isNextDisabled = false,
}) => {
  return (
    <ComponentCard
      title={title}
      className={className}
      desc={desc}
      actions={
        <div className="flex items-center gap-1">
          <NavButton
            direction="prev"
            onClick={onPrevClick}
            disabled={isPrevDisabled}
          />
          <NavButton
            direction="next"
            onClick={onNextClick}
            disabled={isNextDisabled}
          />
        </div>
      }
    >
      {children}
    </ComponentCard>
  );
};

export default NavigableCard;
