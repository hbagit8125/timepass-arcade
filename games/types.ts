// The contract every game implements. The shell (components/GameShell.tsx)
// owns the score display, best score, restart, pause and the end screen;
// a game only reports what happened.

export type GameResult = {
  score: number;
  won?: boolean;
  /** Optional extra line for the end screen, e.g. "The word was PLANT." */
  message?: string;
};

export type GameProps = {
  /** True while the shell has the game paused or the round has ended. */
  paused: boolean;
  /** Call whenever the score changes. */
  onScore: (score: number) => void;
  /** Call once when the round is over. */
  onEnd: (result: GameResult) => void;
};
