export const SYMBOLS = [
  { icon: "🍋", name: "lemon" },
  { icon: "🌙", name: "moon" },
  { icon: "🍄", name: "mushroom" },
  { icon: "🌼", name: "flower" },
  { icon: "🐚", name: "shell" },
  { icon: "🍒", name: "cherries" },
  { icon: "🌈", name: "rainbow" },
  { icon: "🦋", name: "butterfly" },
  { icon: "⭐", name: "star" },
  { icon: "🐸", name: "frog" }
];

export const CODE_LENGTH = 4;
export const MAX_ATTEMPTS = 8;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createRound(symbolCount) {
  const availableSymbols = shuffle(SYMBOLS.map((_, index) => index)).slice(0, symbolCount);
  return {
    availableSymbols,
    secret: shuffle(availableSymbols).slice(0, CODE_LENGTH)
  };
}

export function scoreGuess(guess, answer) {
  let exact = 0;
  const remainingGuess = [];
  const remainingAnswer = [];

  guess.forEach((symbol, index) => {
    if (symbol === answer[index]) {
      exact += 1;
    } else {
      remainingGuess.push(symbol);
      remainingAnswer.push(answer[index]);
    }
  });

  let misplaced = 0;
  remainingGuess.forEach((symbol) => {
    const matchIndex = remainingAnswer.indexOf(symbol);
    if (matchIndex !== -1) {
      misplaced += 1;
      remainingAnswer.splice(matchIndex, 1);
    }
  });

  return { exact, misplaced };
}
