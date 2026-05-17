import { useEffect } from "react";

/**
 * Adds `js-ready` on <html> so reveal styles only apply once JS runs
 * (no blank-screen flash on slow first paint). Then observes [data-reveal]
 * and adds `is-visible` when in view. Items already in the viewport on
 * mount are revealed immediately without waiting for a scroll tick.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.add("js-ready");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    // Reveal anything already on-screen right away (no waiting).
    const vh = window.innerHeight;
    nodes.forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.top < vh * 0.95) n.classList.add("is-visible");
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    nodes.forEach((n) => {
      if (!n.classList.contains("is-visible")) io.observe(n);
    });
    return () => io.disconnect();
  }, []);
}
