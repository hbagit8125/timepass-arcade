const COLORS = ["var(--puzzle)", "var(--arcade)", "var(--classic)", "var(--reflex)"];

// Values are derived from the index, so every render is identical.
const PIECES = Array.from({ length: 44 }, (_, i) => ({
  left: (i * 37) % 100,
  dx: ((i * 53) % 30) - 15,
  rot: 240 + ((i * 71) % 480),
  delay: (i % 11) * 60,
  duration: 1700 + ((i * 29) % 1200),
  color: COLORS[i % COLORS.length],
  wide: i % 3 === 0,
}));

export function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {PIECES.map((p, i) => (
        <i
          key={i}
          className="absolute top-0 block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.wide ? 14 : 8,
            height: p.wide ? 8 : 14,
            background: p.color,
            ["--dx" as string]: `${p.dx}vw`,
            ["--rot" as string]: `${p.rot}deg`,
            animation: `confetti-fall ${p.duration}ms ${p.delay}ms cubic-bezier(0.3, 0.6, 0.6, 1) both`,
          }}
        />
      ))}
    </div>
  );
}
