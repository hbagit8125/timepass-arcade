// The single list of games. Adding a game = one entry here, one folder in
// /games, and one line in /games/loaders.ts.

export type Category = "puzzle" | "arcade" | "classic" | "reflex";

export type GameMeta = {
  slug: string;
  name: string;
  category: Category;
  tagline: string;
  /** Lucide icon name, resolved in components/GameIcon.tsx */
  icon: string;
  /** false until the game is built; shown as "Coming soon" */
  playable: boolean;
  /** Shown in the "How to play" panel */
  howTo: { keyboard: string; touch: string; goal: string };
  /** Real-time games can be paused; turn-based ones don't need it */
  pausable: boolean;
};

const soon = {
  playable: false,
  pausable: false,
  howTo: { keyboard: "", touch: "", goal: "" },
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "puzzle", label: "Puzzle" },
  { id: "arcade", label: "Arcade" },
  { id: "classic", label: "Classic" },
  { id: "reflex", label: "Reflex" },
];

export const GAMES: GameMeta[] = [
  {
    slug: "2048",
    name: "2048",
    category: "puzzle",
    tagline: "Slide tiles, merge matching numbers, reach 2048.",
    icon: "Grid2x2",
    playable: true,
    pausable: false,
    howTo: {
      keyboard: "Arrow keys or W A S D slide every tile.",
      touch: "Swipe on the board in any direction.",
      goal: "Two tiles with the same number merge into one. Make a 2048 tile, then keep going for a higher score.",
    },
  },
  { slug: "sudoku", name: "Sudoku", category: "puzzle", tagline: "Fill the grid so every row, column and box has 1 to 9.", icon: "Grid3x3", ...soon },
  { slug: "minesweeper", name: "Minesweeper", category: "puzzle", tagline: "Clear the field without touching a mine.", icon: "Bomb", ...soon },
  { slug: "memory-match", name: "Memory Match", category: "puzzle", tagline: "Flip cards and find every pair.", icon: "Layers2", ...soon },
  { slug: "word-guess", name: "Word Guess", category: "puzzle", tagline: "Find the five-letter word in six tries.", icon: "WholeWord", ...soon },
  { slug: "sliding-puzzle", name: "Sliding Puzzle", category: "puzzle", tagline: "Slide the tiles back into order.", icon: "Puzzle", ...soon },

  { slug: "snake", name: "Snake", category: "arcade", tagline: "Eat, grow, and don't bite your own tail.", icon: "Worm", ...soon },
  { slug: "brick-breaker", name: "Brick Breaker", category: "arcade", tagline: "Bounce the ball and clear every brick.", icon: "BrickWall", ...soon },
  { slug: "falling-blocks", name: "Falling Blocks", category: "arcade", tagline: "Stack the falling shapes and clear lines.", icon: "Blocks", ...soon },
  { slug: "flap", name: "Flap", category: "arcade", tagline: "Tap to fly through the gaps.", icon: "Bird", ...soon },
  { slug: "paddle-duel", name: "Paddle Duel", category: "arcade", tagline: "Beat the computer at table tennis.", icon: "Columns2", ...soon },
  { slug: "dash", name: "Dash", category: "arcade", tagline: "Run, jump, and see how far you get.", icon: "Footprints", ...soon },

  { slug: "tic-tac-toe", name: "Tic-Tac-Toe", category: "classic", tagline: "Three in a row against the computer.", icon: "Hash", ...soon },
  { slug: "connect-four", name: "Connect Four", category: "classic", tagline: "Drop discs and line up four.", icon: "CircleDot", ...soon },
  { slug: "hangman", name: "Hangman", category: "classic", tagline: "Guess the word one letter at a time.", icon: "PersonStanding", ...soon },
  { slug: "rock-paper-scissors", name: "Rock Paper Scissors", category: "classic", tagline: "Best of five against the computer.", icon: "Scissors", ...soon },

  { slug: "whack-a-mole", name: "Whack-a-Mole", category: "reflex", tagline: "Hit the moles before they duck.", icon: "Hammer", ...soon },
  { slug: "echo", name: "Echo", category: "reflex", tagline: "Repeat the pattern of lights as it grows.", icon: "Lightbulb", ...soon },
  { slug: "reaction-time", name: "Reaction Time", category: "reflex", tagline: "Tap the moment the screen changes.", icon: "Zap", ...soon },
  { slug: "typing-speed", name: "Typing Speed", category: "reflex", tagline: "Type as many words as you can in a minute.", icon: "Keyboard", ...soon },
];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);
export const PLAYABLE = GAMES.filter((g) => g.playable);
