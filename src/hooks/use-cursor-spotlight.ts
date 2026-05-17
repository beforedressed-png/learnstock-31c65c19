import { useEffect, useRef } from "react";

/**
 * Tracks the mouse and writes --mx/--my CSS variables on a target element
 * (defaults to <body>). Cheap: one rAF-throttled style write per frame, no
 * React re-render. Powers the .cursor-spotlight utility.
 */
export function useCursorSpotlight() {
  const frame = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const spotlight = document.querySelector<HTMLElement>(".cursor-spotlight");
    if (!spotlight) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!spotlight.classList.contains("is-active")) {
        spotlight.classList.add("is-active");
      }
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        spotlight.style.setProperty("--mx", `${x}px`);
        spotlight.style.setProperty("--my", `${y}px`);
        frame.current = 0;
      });
    };

    // Sheen on cards: write --sx/--sy on hovered element only.
    const onSheen = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(".sheen");
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--sx", `${e.clientX - r.left}px`);
      target.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousemove", onSheen, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", onSheen);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);
}
