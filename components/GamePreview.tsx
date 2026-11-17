import type { ReactNode } from "react";

// A small drawing of each game for its card. Parts with a pv-* class
// animate while the card is hovered or focused (see globals.css).

const C = "var(--cat)";
const I = "var(--ink)";
const S = "var(--surface-strong)";
const P = "var(--puzzle)";
const A = "var(--arcade)";
const K = "var(--classic)";
const R = "var(--reflex)";
const D = "var(--on-accent)";

type BoxProps = { x: number; y: number; w: number; h?: number; fill: string; r?: number; className?: string };
const Box = ({ x, y, w, h = w, fill, r = 4, className }: BoxProps) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} className={className} />
);

const Label = ({ x, y, size = 13, fill = D, children }: { x: number; y: number; size?: number; fill?: string; children: ReactNode }) => (
  <text x={x} y={y} fontSize={size} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={fill}>
    {children}
  </text>
);

/** `count` boxes in a row. `fills[i]` picks each colour. */
const row = (count: number, x: number, y: number, size: number, gap: number, fills: (i: number) => string) =>
  Array.from({ length: count }, (_, i) => <Box key={`${y}-${i}`} x={x + i * (size + gap)} y={y} w={size} fill={fills(i)} r={3} />);

const PREVIEWS: Record<string, ReactNode> = {
  "2048": (
    <>
      <Box x={14} y={22} w={28} fill={S} r={6} />
      <Label x={28} y={36} fill={I}>2</Label>
      <Box x={46} y={22} w={28} fill={R} r={6} />
      <Label x={60} y={36}>4</Label>
      <g className="pv-pop">
        <Box x={78} y={22} w={28} fill={C} r={6} />
        <Label x={92} y={36}>8</Label>
      </g>
    </>
  ),
  sudoku: (
    <>
      {[0, 1, 2].map((r) => row(3, 33, 9 + r * 19, 16, 3, (i) => (r === 1 && i === 1 ? "transparent" : S)))}
      <Box x={52} y={28} w={16} fill={C} r={3} className="pv-blink" />
      <Label x={41} y={17} size={10} fill={I}>5</Label>
      <Label x={79} y={36} size={10} fill={I}>3</Label>
      <Label x={60} y={36} size={10}>7</Label>
      <Label x={41} y={55} size={10} fill={I}>9</Label>
    </>
  ),
  minesweeper: (
    <>
      {[0, 1, 2].map((r) => row(4, 24, 9 + r * 19, 16, 3, (i) => ((r + i) % 3 === 0 ? "transparent" : S)))}
      <Label x={32} y={17} size={10} fill={K}>1</Label>
      <Label x={89} y={17} size={10} fill={R}>2</Label>
      <Label x={70} y={36} size={10} fill={A}>3</Label>
      <circle cx={51} cy={55} r={6} fill={A} className="pv-pop" />
      <path d="M86 49v13M86 49l8 4-8 4" fill={C} stroke={C} strokeWidth={2} strokeLinejoin="round" />
    </>
  ),
  "memory-match": (
    <>
      <Box x={12} y={18} w={20} h={36} fill={S} r={5} />
      <Box x={38} y={18} w={20} h={36} fill={C} r={5} />
      <circle cx={48} cy={36} r={5} fill={D} />
      <Box x={64} y={18} w={20} h={36} fill={S} r={5} />
      <g className="pv-blink">
        <Box x={90} y={18} w={20} h={36} fill={C} r={5} />
        <circle cx={100} cy={36} r={5} fill={D} />
      </g>
    </>
  ),
  "word-guess": (
    <>
      {row(5, 11, 27, 18, 2, (i) => [K, S, P, S, K][i])}
      {[..."WORDS"].map((ch, i) => (
        <Label key={i} x={20 + i * 20} y={36} size={11} fill={i % 2 ? I : D}>{ch}</Label>
      ))}
      <rect x={91} y={27} width={18} height={18} rx={3} fill="none" stroke={I} strokeWidth={2} className="pv-blink" />
    </>
  ),
  "sliding-puzzle": (
    <>
      {[0, 1, 2].map((r) => row(3, 33, 9 + r * 19, 16, 3, (i) => (r === 2 && i > 0 ? "transparent" : r === 0 ? C : S)))}
      <Box x={52} y={47} w={16} fill={S} r={3} className="pv-slide" />
    </>
  ),
  snake: (
    <>
      {row(4, 22, 30, 12, 2, () => C)}
      <Box x={78} y={30} w={12} fill={I} r={3} />
      <Box x={22} y={44} w={12} fill={C} r={3} />
      <circle cx={102} cy={22} r={5} fill={P} className="pv-blink" />
    </>
  ),
  "brick-breaker": (
    <>
      {[0, 1, 2, 3, 4].map((i) => <Box key={`a${i}`} x={13 + i * 19} y={10} w={16} h={7} fill={A} r={2} />)}
      {[0, 1, 2, 3, 4].map((i) => <Box key={`b${i}`} x={13 + i * 19} y={20} w={16} h={7} fill={i === 3 ? "transparent" : P} r={2} />)}
      <circle cx={70} cy={42} r={4} fill={I} className="pv-bob" />
      <Box x={44} y={58} w={32} h={5} fill={I} r={2.5} />
    </>
  ),
  "falling-blocks": (
    <>
      <g className="pv-bob">
        {row(3, 45, 8, 10, 1, () => R)}
        <Box x={56} y={19} w={10} fill={R} r={3} />
      </g>
      {row(6, 28, 54, 10, 1, (i) => [K, K, P, C, C, P][i])}
      {row(4, 28, 43, 10, 1, (i) => [K, P, P, C][i])}
    </>
  ),
  flap: (
    <>
      <Box x={70} y={-6} w={16} h={26} fill={K} r={5} />
      <Box x={70} y={48} w={16} h={30} fill={K} r={5} />
      <g className="pv-bob">
        <Box x={34} y={26} w={16} fill={C} r={5} />
        <circle cx={45} cy={32} r={3} fill="#fff" />
        <path d="M50 33l6 3-6 3z" fill={P} />
      </g>
    </>
  ),
  "paddle-duel": (
    <>
      <Box x={58} y={8} w={30} h={5} fill={A} r={2.5} />
      <path d="M12 36h96" stroke="var(--line)" strokeWidth={2} strokeDasharray="6 6" />
      <circle cx={52} cy={44} r={4} fill={I} className="pv-bob" />
      <Box x={36} y={59} w={30} h={5} fill={K} r={2.5} className="pv-slide" />
    </>
  ),
  dash: (
    <>
      <path d="M8 56h104" stroke="var(--line)" strokeWidth={2} />
      <Box x={74} y={38} w={10} h={18} fill={A} r={3} />
      <g className="pv-jump">
        <Box x={30} y={40} w={16} fill={R} r={5} />
        <circle cx={41} cy={46} r={3} fill="#fff" />
      </g>
    </>
  ),
  "tic-tac-toe": (
    <>
      <path d="M50 12v48M70 12v48M36 28h48M36 44h48" stroke="var(--line)" strokeWidth={2.5} strokeLinecap="round" />
      <Label x={43} y={20} fill={C}>X</Label>
      <Label x={60} y={36} fill={A}>O</Label>
      <Label x={77} y={52} fill={C}>X</Label>
      <g className="pv-blink">
        <Label x={77} y={20} fill={A}>O</Label>
      </g>
    </>
  ),
  "connect-four": (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const discs: Record<string, string> = { "2-0": A, "2-1": P, "2-2": A, "2-3": P, "1-1": P, "1-2": A, "1-3": P };
          const fill = discs[`${r}-${c}`] ?? S;
          return <circle key={`${r}-${c}`} cx={24 + c * 18} cy={18 + r * 18} r={7} fill={fill} />;
        }),
      )}
      <circle cx={60} cy={18} r={7} fill={P} className="pv-blink" />
    </>
  ),
  hangman: (
    <>
      <path d="M22 60h34M32 60V10h26v8" fill="none" stroke="var(--muted)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <g fill="none" stroke={C} strokeWidth={3} strokeLinecap="round">
        <circle cx={58} cy={25} r={6} className="pv-blink" />
        <path d="M58 31v15M58 36l-8 6M58 36l8 6" />
      </g>
      <path d="M72 58h8M84 58h8M96 58h8" stroke={I} strokeWidth={3} strokeLinecap="round" />
      <Label x={88} y={49} size={11} fill={I}>A</Label>
    </>
  ),
  "rock-paper-scissors": (
    <>
      <circle cx={26} cy={36} r={13} fill={S} />
      <Box x={48} y={20} w={24} h={32} fill={C} r={5} className="pv-pop" />
      <path d="M86 26l18 20M104 26L86 46" stroke={A} strokeWidth={4} strokeLinecap="round" />
      <circle cx={26} cy={36} r={6} fill="var(--muted)" />
    </>
  ),
  "whack-a-mole": (
    <>
      <ellipse cx={26} cy={52} rx={15} ry={6} fill={S} />
      <ellipse cx={94} cy={52} rx={15} ry={6} fill={S} />
      <g className="pv-bob">
        <path d="M48 52V36a12 12 0 0 1 24 0v16z" fill={C} />
        <circle cx={55} cy={36} r={2.2} fill={D} />
        <circle cx={65} cy={36} r={2.2} fill={D} />
      </g>
      <ellipse cx={60} cy={54} rx={17} ry={6} fill={S} />
    </>
  ),
  echo: (
    <>
      <Box x={36} y={12} w={22} fill={K} r={7} />
      <Box x={62} y={12} w={22} fill={A} r={7} className="pv-blink" />
      <Box x={36} y={38} w={22} fill={P} r={7} />
      <Box x={62} y={38} w={22} fill={R} r={7} />
    </>
  ),
  "reaction-time": (
    <>
      <Box x={18} y={14} w={84} h={44} fill={K} r={10} className="pv-blink" />
      <path d="M63 20L50 38h9l-3 14 14-19h-9z" fill={D} />
    </>
  ),
  "typing-speed": (
    <>
      {row(6, 12, 18, 14, 3, (i) => (i === 2 ? "transparent" : S))}
      <Box x={46} y={18} w={14} fill={C} r={3} className="pv-pop" />
      {row(5, 20, 36, 14, 3, () => S)}
      <Box x={36} y={54} w={48} h={8} fill={S} r={4} />
    </>
  ),
};

export function GamePreview({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 72" className={`pv ${className ?? ""}`} aria-hidden>
      {PREVIEWS[slug]}
    </svg>
  );
}
