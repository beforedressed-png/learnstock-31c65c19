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
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
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
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
