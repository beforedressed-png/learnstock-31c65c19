import { Sparkles } from "lucide-react";

const ITEMS = [
  "Gemini",
  "Adobe Stock",
  "CSV export",
  "Batch processing",
  "Single-word keywords",
  "Custom prompts",
  "Privacy-first",
  "BYOK",
  "SEO-tuned",
  "Contributor-ready",
];

export function MarqueeStrip() {
  const row = (
    <div className="marquee__row" aria-hidden="false">
      {ITEMS.map((t, i) => (
        <span key={`${t}-${i}`} className="marquee__item">
          <Sparkles className="h-3 w-3 text-primary-glow" />
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-label="Highlights">
      <div className="marquee__track">
        {row}
        <div className="marquee__row" aria-hidden="true">
          {ITEMS.map((t, i) => (
            <span key={`dup-${t}-${i}`} className="marquee__item">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
