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
  { slug: "sudoku", name: "Sudoku", category: "puzzle", tagline: "Fill the grid so every row, column and box has 1 to 9.", icon: "Grid3x3", playable: true, pausable: false, howTo: { keyboard: "Click a square, then type 1 to 9. Arrow keys move around, Backspace clears.", touch: "Tap a square, then tap a number below the grid.", goal: "Fill every square so each row, column and 3 by 3 box holds 1 to 9 once. Faster solves with fewer mistakes score higher." } },
  { slug: "minesweeper", name: "Minesweeper", category: "puzzle", tagline: "Clear the field without touching a mine.", icon: "Bomb", playable: true, pausable: false, howTo: { keyboard: "Click to dig. Right-click to place a flag.", touch: "Tap to dig. Press and hold to flag, or switch to Flag below the board.", goal: "A number tells you how many mines touch that square. Open every safe square without digging up a mine. Your first dig is always safe." } },
  { slug: "memory-match", name: "Memory Match", category: "puzzle", tagline: "Flip cards and find every pair.", icon: "Layers2", playable: true, pausable: false, howTo: { keyboard: "Tab to a card and press Enter to flip it.", touch: "Tap a card to flip it.", goal: "Flip two cards at a time. Matching pairs stay face up. Find all eight pairs with as few wrong flips as you can." } },
  { slug: "word-guess", name: "Word Guess", category: "puzzle", tagline: "Find the five-letter word in six tries.", icon: "WholeWord", playable: true, pausable: false, howTo: { keyboard: "Type a word and press Enter. Backspace deletes a letter.", touch: "Use the letter keys below the grid.", goal: "Guess the five-letter word in six tries. Teal means the letter is in the right place, amber means it is in the word but elsewhere, grey means it is not in the word. Any five letters are accepted as a guess." } },
  { slug: "sliding-puzzle", name: "Sliding Puzzle", category: "puzzle", tagline: "Slide the tiles back into order.", icon: "Puzzle", playable: true, pausable: false, howTo: { keyboard: "Arrow keys slide a tile into the gap.", touch: "Tap a tile next to the gap.", goal: "Put the tiles in order from 1 to 8, with the gap in the bottom right corner. Fewer moves score higher." } },

  { slug: "snake", name: "Snake", category: "arcade", tagline: "Eat, grow, and don't bite your own tail.", icon: "Worm", playable: true, pausable: true, howTo: { keyboard: "Arrow keys or W A S D to steer. P to pause.", touch: "Swipe on the field in the direction you want to go.", goal: "Eat the dots to grow and score 10 each. The snake speeds up as it grows. Hitting a wall or yourself ends the game." } },
  { slug: "brick-breaker", name: "Brick Breaker", category: "arcade", tagline: "Bounce the ball and clear every brick.", icon: "BrickWall", playable: true, pausable: true, howTo: { keyboard: "Left and right arrows move the paddle. Space launches the ball. P to pause.", touch: "Drag to move the paddle. Lift your finger to launch the ball.", goal: "Bounce the ball to clear every brick. You have three lives, and each new level is faster." } },
  { slug: "falling-blocks", name: "Falling Blocks", category: "arcade", tagline: "Stack the falling shapes and clear lines.", icon: "Blocks", playable: true, pausable: true, howTo: { keyboard: "Left and right arrows move, up rotates, down moves down, Space drops. P to pause.", touch: "Use the five buttons below the field.", goal: "Fit the falling shapes together. A full row clears and scores, and clearing several at once scores more. The game ends when the shapes reach the top." } },
  { slug: "flap", name: "Flap", category: "arcade", tagline: "Tap to fly through the gaps.", icon: "Bird", playable: true, pausable: true, howTo: { keyboard: "Space or the up arrow to flap. P to pause.", touch: "Tap the field to flap.", goal: "Each flap lifts you a little. Fly through the gaps in the gates. One point for every gate passed." } },
  { slug: "paddle-duel", name: "Paddle Duel", category: "arcade", tagline: "Beat the computer at table tennis.", icon: "Columns2", playable: true, pausable: true, howTo: { keyboard: "Left and right arrows move your paddle. P to pause.", touch: "Drag left and right to move your paddle.", goal: "Your paddle is at the bottom. Get the ball past the computer for 100 points. The computer speeds up as you score, and the game ends when it has scored five." } },
  { slug: "dash", name: "Dash", category: "arcade", tagline: "Run, jump, and see how far you get.", icon: "Footprints", playable: true, pausable: true, howTo: { keyboard: "Space or the up arrow to jump. Hold for a higher jump. P to pause.", touch: "Tap to jump. Hold for a higher jump.", goal: "Jump over the blocks. You speed up the further you get, and your score is the distance you ran." } },

  { slug: "tic-tac-toe", name: "Tic-Tac-Toe", category: "classic", tagline: "Three in a row against the computer.", icon: "Hash", playable: true, pausable: false, howTo: { keyboard: "Press 1 to 9 for the squares, counted left to right, top to bottom.", touch: "Tap an empty square.", goal: "You are X and move first. A win adds 100 and a draw adds 30, then a new round starts. Your run ends when the computer wins." } },
  { slug: "connect-four", name: "Connect Four", category: "classic", tagline: "Drop discs and line up four.", icon: "CircleDot", playable: true, pausable: false, howTo: { keyboard: "Press 1 to 7 to drop in that column, or use the left and right arrows and press Enter.", touch: "Tap a column.", goal: "Take turns dropping discs. Line up four in a row, column or diagonal. A win adds 100 and a full board adds 30. Your run ends when the computer connects four." } },
  { slug: "hangman", name: "Hangman", category: "classic", tagline: "Guess the word one letter at a time.", icon: "PersonStanding", playable: true, pausable: false, howTo: { keyboard: "Type a letter.", touch: "Tap a letter.", goal: "Guess the word one letter at a time, using the clue. Six wrong guesses ends the game. Each solved word adds up to 100, less 10 for each wrong guess." } },
  { slug: "rock-paper-scissors", name: "Rock Paper Scissors", category: "classic", tagline: "First to three points wins the match.", icon: "Scissors", playable: true, pausable: false, howTo: { keyboard: "Press R, P or S.", touch: "Tap Rock, Paper or Scissors.", goal: "Rock beats scissors, scissors beats paper, paper beats rock. First to three points wins the match. A match win adds 100, or 150 if the computer scored nothing. Losing a match ends your run." } },

  { slug: "whack-a-mole", name: "Whack-a-Mole", category: "reflex", tagline: "Hit the moles before they duck.", icon: "Hammer", playable: true, pausable: true, howTo: { keyboard: "Press 1 to 9 for the holes, counted left to right, top to bottom. P to pause.", touch: "Tap a mole.", goal: "You have 30 seconds. A mole is worth 10 and a gold one is worth 30. They show up faster and hide sooner as the clock runs down." } },
  { slug: "echo", name: "Echo", category: "reflex", tagline: "Repeat the pattern of lights as it grows.", icon: "Lightbulb", playable: true, pausable: false, howTo: { keyboard: "Press 1 to 4 for the pads.", touch: "Tap the pads.", goal: "Watch the pads light up, then repeat the pattern in the same order. The pattern grows by one each round. One wrong pad ends the game." } },
  { slug: "reaction-time", name: "Reaction Time", category: "reflex", tagline: "Tap the moment the screen changes.", icon: "Zap", playable: true, pausable: false, howTo: { keyboard: "Press Space or Enter.", touch: "Tap the panel.", goal: "Wait for the panel to turn teal, then tap as fast as you can. Five rounds. Your score is 1,000 minus your average time in milliseconds, so faster is higher." } },
  { slug: "typing-speed", name: "Typing Speed", category: "reflex", tagline: "Type as many words as you can in a minute.", icon: "Keyboard", playable: true, pausable: false, howTo: { keyboard: "Type the highlighted word, then press Space.", touch: "Tap the box to bring up your keyboard, then type.", goal: "You have 60 seconds. Your score is words per minute, counted the standard way as five characters per word. Words with a mistake don't count." } },
];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);
export const PLAYABLE = GAMES.filter((g) => g.playable);
