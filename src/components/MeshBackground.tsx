/** Animated gradient mesh — pure CSS, GPU-only. */
export function MeshBackground({ intensity = 1 }: { intensity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="mesh-bg pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ opacity: intensity }}
    >
      <span className="mesh-blob mesh-blob--a" />
      <span className="mesh-blob mesh-blob--b" />
      <span className="mesh-blob mesh-blob--c" />
    </div>
  );
}
