import {
  Bird, Blocks, Bomb, BrickWall, CircleDot, Columns2, Footprints, Gamepad2, Grid2x2, Grid3x3,
  Hammer, Hash, Keyboard, Layers2, Lightbulb, PersonStanding, Puzzle, Scissors, WholeWord, Worm,
  Zap, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Bird, Blocks, Bomb, BrickWall, CircleDot, Columns2, Footprints, Grid2x2, Grid3x3, Hammer, Hash,
  Keyboard, Layers2, Lightbulb, PersonStanding, Puzzle, Scissors, WholeWord, Worm, Zap,
};

export function GameIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Gamepad2;
  return <Icon className={className} aria-hidden strokeWidth={2.2} />;
}
