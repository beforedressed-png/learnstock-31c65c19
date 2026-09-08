import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={
        "fixed bottom-6 right-6 z-40 flex h-9 w-9 items-center justify-center rounded-lg " +
        "bg-primary text-primary-foreground shadow-sm " +
        "transition-all duration-300 ease-out hover:bg-primary/90 hover:scale-105 active:scale-95 " +
        (visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-3 opacity-0 pointer-events-none")
      }
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
