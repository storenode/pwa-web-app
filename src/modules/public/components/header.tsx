import { StoreNodeLogo } from "../../../shared/components/StoreNodeLogo";
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
          <StoreNodeLogo className="h-[6rem] w-full" />
        </a>

        {/* Theme toggle lives here */}
        <ThemeToggle />
      </div>
    </header>
  );
}
