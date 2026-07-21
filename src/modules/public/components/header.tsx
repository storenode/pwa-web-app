import { LogoDark } from "../../../shared/components/LogoDark";
import { LogoLight } from "../../../shared/components/LogoLight";
import ThemeToggle from "../../../shared/components/ThemeToggle";

export default function PublicHeaderView() {
  return (
    <header className="p-4 transition-colors duration-300">
      <div className="container flex justify-between items-center h-16 mx-auto">
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
