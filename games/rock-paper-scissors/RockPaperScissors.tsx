"use client";

import { Hand, HandFist, Scissors, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

type Move = "rock" | "paper" | "scissors";

const MOVES: { id: Move; label: string; key: string; Icon: LucideIcon; beats: Move }[] = [
  { id: "rock", label: "Rock", key: "r", Icon: HandFist, beats: "scissors" },
  { id: "paper", label: "Paper", key: "p", Icon: Hand, beats: "rock" },
  { id: "scissors", label: "Scissors", key: "s", Icon: Scissors, beats: "paper" },
];
const byId = (id: Move) => MOVES.find((m) => m.id === id)!;

const TARGET = 3;

function Pips({ filled, tone }: { filled: number; tone: string }) {
  return (
    <span className="flex gap-1.5" aria-hidden>
      {Array.from({ length: TARGET }, (_, i) => (
        <i key={i} className={`size-3 rounded-full ${i < filled ? tone : "bg-surface-strong"}`} />
      ))}
    </span>
  );
}

export default function RockPaperScissors({ paused, onScore, onEnd }: GameProps) {
  const [you, setYou] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [hands, setHands] = useState<{ yours: Move; theirs: Move } | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [match, setMatch] = useState(1);
  const [note, setNote] = useState("First to three wins the match. Pick your hand.");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function throwHand(yours: Move) {
    if (paused || busy) return;
    const theirs = pick(MOVES).id;
    setHands({ yours, theirs });
    sfx.click();

    if (yours === theirs) return setNote(`Both chose ${byId(yours).label.toLowerCase()}. Go again.`);

    const youWin = byId(yours).beats === theirs;
    const nextYou = you + (youWin ? 1 : 0);
    const nextCpu = cpu + (youWin ? 0 : 1);
    setYou(nextYou);
    setCpu(nextCpu);
    const [winner, loser] = youWin ? [yours, theirs] : [theirs, yours];
    const line = `${byId(winner).label} beats ${byId(loser).label.toLowerCase()}.`;

    if (nextCpu === TARGET) {
      setBusy(true);
      setNote(`${line} The computer takes the match.`);
      sfx.lose();
      timer.current = window.setTimeout(
        () => onEnd({ score, message: `You lost match ${match}, ${nextYou} to ${nextCpu}.` }),
        1300,
      );
    } else if (nextYou === TARGET) {
      // A clean sweep is worth more.
      const total = score + 100 + (nextCpu === 0 ? 50 : 0);
      setBusy(true);
      setScore(total);
      onScore(total);
      setNote(`${line} You take the match.`);
      sfx.merge(7);
      timer.current = window.setTimeout(() => {
        setYou(0);
        setCpu(0);
        setHands(null);
        setMatch(match + 1);
        setBusy(false);
        setNote("New match. Pick your hand.");
      }, 1500);
    } else {
      setNote(`${line} ${youWin ? "Your point." : "Computer's point."}`);
      sfx.move();
    }
  }

  useKey((key) => {
    const move = MOVES.find((m) => m.key === key.toLowerCase());
    if (move) return throwHand(move.id), true;
  });

  const Yours = hands ? byId(hands.yours).Icon : null;
  const Theirs = hands ? byId(hands.theirs).Icon : null;
  const face = "grid aspect-square w-full place-items-center rounded-3xl";

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <p className="mb-3 text-sm text-muted">Match {match}</p>

      <div className="glass grid w-full grid-cols-2 gap-4 rounded-3xl p-5 shadow-lift">
        <div className="flex flex-col items-center gap-3">
          <div className={`${face} ${Yours ? "bg-(--cat) text-on-accent" : "bg-surface-strong text-muted"}`}>
            {Yours ? (
              <Yours key={`${you}-${cpu}-${hands?.yours}`} className="size-1/2 motion-safe:animate-[tile-in_180ms_ease-out]" strokeWidth={2} aria-hidden />
            ) : (
              <span className="font-display text-5xl font-extrabold">?</span>
            )}
          </div>
          <span className="text-sm font-medium">You</span>
          <Pips filled={you} tone="bg-(--cat)" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className={`${face} ${Theirs ? "bg-arcade text-on-accent" : "bg-surface-strong text-muted"}`}>
            {Theirs ? (
              <Theirs key={`${you}-${cpu}-${hands?.theirs}`} className="size-1/2 -scale-x-100 motion-safe:animate-[tile-in_180ms_ease-out]" strokeWidth={2} aria-hidden />
            ) : (
              <span className="font-display text-5xl font-extrabold">?</span>
            )}
          </div>
          <span className="text-sm font-medium">Computer</span>
          <Pips filled={cpu} tone="bg-arcade" />
        </div>
      </div>

      <p className="mt-4 min-h-5 text-center text-sm text-muted" aria-live="polite">
        {note} <span className="sr-only">You {you}, computer {cpu}.</span>
      </p>

      <div className="mt-3 grid w-full grid-cols-3 gap-2.5">
        {MOVES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => throwHand(id)}
            disabled={busy}
            className="glass flex touch-manipulation flex-col items-center gap-2 rounded-2xl py-4 font-medium transition-[background-color,scale] hover:bg-surface-strong active:scale-95 disabled:opacity-50"
          >
            <Icon className="size-8" strokeWidth={2} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
