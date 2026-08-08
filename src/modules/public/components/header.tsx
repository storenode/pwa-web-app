import { LogoDark } from "../../../shared/components/LogoDark";
import { LogoLight } from "../../../shared/components/LogoLight";
import ThemeToggle from "../../../shared/components/ThemeToggle";
import { useScrolled } from "../../../shared/hooks/useScrolled";

interface PublicHeaderViewProps {
  /** Pages without a tall hero photo (nothing for the header to sit transparently over) should force the solid/scrolled look from the start instead of starting transparent. */
  forceSolid?: boolean;
}

export default function PublicHeaderView({
  forceSolid = false,
}: PublicHeaderViewProps = {}) {
  const scrolledState = useScrolled(
    typeof window === "undefined" ? 500 : window.innerHeight * 0.7,
  );
  const scrolled = forceSolid || scrolledState;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 p-4 transition-colors duration-300 ${
        scrolled
          ? "bg-base-200/90 backdrop-blur border-b border-base-300 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div
        className={`container flex justify-between items-center h-16 mx-auto transition-colors duration-300 ${
          scrolled ? "text-base-content" : "text-white"
        }`}
      >
        <a
          rel="noopener noreferrer"
          href="#"
          aria-label="Back to homepage"
          className="flex items-center p-2"
        >
          <LogoLight className="h-20 sm:h-18 w-auto shrink-0 dark:hidden" />
          <LogoDark className="h-20 sm:h-18 w-auto shrink-0 hidden dark:block" />
        </a>

        {/* Theme toggle lives here */}
        <ThemeToggle />
      </div>
    </header>
  );
}
