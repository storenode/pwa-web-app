import { useEffect, useState } from "react";

/** True once the page has been scrolled past `threshold` px. */
export function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(
    typeof window === "undefined" ? false : window.scrollY > threshold,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
