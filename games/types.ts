// The contract every game implements. The shell (components/GameShell.tsx)
// owns the score display, best score, restart, pause and the end screen;
// a game only reports what happened.

export type GameProps = {
  /** True while the shell has the game paused. Real-time games must stop their loop. */
  paused: boolean;
  /** Call whenever the score changes. */
  onScore: (score: number) => void;
  /** Call once when the round is over. */
  onEnd: (result: { score: number; won?: boolean }) => void;
};
