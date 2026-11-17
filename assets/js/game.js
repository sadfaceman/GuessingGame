import { CODE_LENGTH, MAX_ATTEMPTS, SYMBOLS, createRound, scoreGuess } from "./game-logic.js";

const board = document.querySelector("#board");
const tray = document.querySelector("#symbol-tray");
const turnCount = document.querySelector("#turn-count");
const secretCode = document.querySelector("#secret-code");
const submitButton = document.querySelector("#submit-guess");
const newGameButton = document.querySelector("#new-game");
const challengeSize = document.querySelector("#challenge-size");
const keyboardHint = document.querySelector("#keyboard-hint");
const selectionHint = document.querySelector("#selection-hint");
const gameMessage = document.querySelector("#game-message");

let secret = [];
let availableSymbols = [];
let guesses = [];
let currentGuess = Array(CODE_LENGTH).fill(null);
let focusedSlot = 0;
let gameOver = false;

function createSecret() {
  const round = createRound(Number(challengeSize.value));
  availableSymbols = round.availableSymbols;
  return round.secret;
}

function makeSlotButton({ label, value = "", disabled = false, active = false, onClick }) {
  const slot = document.createElement("button");
  slot.type = "button";
  slot.className = `guess-slot${active ? " active" : ""}`;
  slot.textContent = value;
  slot.setAttribute("aria-label", label);
  slot.disabled = disabled;
  if (onClick) slot.addEventListener("click", onClick);
  return slot;
}

function renderBoard() {
  board.replaceChildren();

  for (let rowIndex = 0; rowIndex < MAX_ATTEMPTS; rowIndex += 1) {
    const row = document.createElement("div");
    row.className = "guess-row";
    const guessIndex = rowIndex;

    const number = document.createElement("span");
    number.className = "row-number";
    number.textContent = String(rowIndex + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");
    row.append(number);

    const slots = document.createElement("div");
    slots.className = "guess-slots";
    const submittedGuess = guesses[guessIndex];
    const isCurrentRow = guessIndex === guesses.length && !gameOver;
    const isFutureRow = guessIndex > guesses.length || gameOver && guessIndex >= guesses.length;
    const rowGuess = submittedGuess
      ? submittedGuess.symbols
      : isCurrentRow
        ? currentGuess
        : Array(CODE_LENGTH).fill(null);

    if (submittedGuess) row.classList.add("submitted");
    if (isFutureRow) row.classList.add("future");

    rowGuess.forEach((symbolIndex, slotIndex) => {
      const symbol = symbolIndex === null ? "" : SYMBOLS[symbolIndex].icon;
      const label = submittedGuess
        ? `${SYMBOLS[symbolIndex].name}, position ${slotIndex + 1}`
        : symbol
          ? `${SYMBOLS[symbolIndex].name}, position ${slotIndex + 1}. Select to change`
          : `Empty position ${slotIndex + 1}`;
      const canEdit = isCurrentRow;

      slots.append(makeSlotButton({
        label,
        value: symbol,
        disabled: !canEdit,
        active: canEdit && focusedSlot === slotIndex,
        onClick: canEdit ? () => {
          currentGuess[slotIndex] = null;
          focusedSlot = slotIndex;
          gameMessage.textContent = "";
          render();
        } : undefined
      }));
    });
    row.append(slots);

    const clues = document.createElement("div");
    clues.className = "clue-grid";
    clues.setAttribute("aria-label", submittedGuess
      ? `${submittedGuess.score.exact} correct position, ${submittedGuess.score.misplaced} correct icon in another position`
      : "No clues yet");

    if (submittedGuess) {
      for (let i = 0; i < submittedGuess.score.exact; i += 1) {
        const dot = document.createElement("span");
        dot.className = "clue-dot exact";
        dot.setAttribute("aria-hidden", "true");
        clues.append(dot);
      }
      for (let i = 0; i < submittedGuess.score.misplaced; i += 1) {
        const dot = document.createElement("span");
        dot.className = "clue-dot misplaced";
        dot.setAttribute("aria-hidden", "true");
        clues.append(dot);
      }
    } else {
      for (let i = 0; i < CODE_LENGTH; i += 1) {
        const dot = document.createElement("span");
        dot.className = "clue-dot";
        dot.setAttribute("aria-hidden", "true");
        clues.append(dot);
      }
    }

    row.append(clues);
    board.append(row);
  }
}

function renderTray() {
  tray.replaceChildren();
  availableSymbols.forEach((symbolIndex, index) => {
    const symbol = SYMBOLS[symbolIndex];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "symbol-button";
    const key = index === 9 ? "0" : String(index + 1);
    button.setAttribute("aria-label", `Choose ${symbol.name}, key ${key}`);
    button.innerHTML = `<span aria-hidden="true">${symbol.icon}</span><span class="symbol-number" aria-hidden="true">${key}</span>`;
    button.addEventListener("click", () => chooseSymbol(symbolIndex));
    tray.append(button);
  });
  keyboardHint.textContent = availableSymbols.length === 10
    ? "or use keys 1–9, 0"
    : `or use keys 1–${availableSymbols.length}`;
}

function renderSecret() {
  const slots = secretCode.querySelectorAll(".secret-slot");
  const reveal = gameOver;

  slots.forEach((slot, index) => {
    slot.textContent = reveal ? SYMBOLS[secret[index]].icon : "?";
    slot.classList.toggle("revealed", reveal);
  });

  secretCode.setAttribute("aria-label", reveal
    ? `Secret code: ${secret.map((symbol) => SYMBOLS[symbol].name).join(", ")}`
    : "Secret code, hidden");
}

function render() {
  renderBoard();
  renderSecret();

  if (gameOver) {
    const lastGuess = guesses[guesses.length - 1];
    if (lastGuess.score.exact === CODE_LENGTH) {
      turnCount.innerHTML = `Solved <span>in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}</span>`;
    } else {
      turnCount.innerHTML = `Game over <span>· ${guesses.length} of ${MAX_ATTEMPTS} tries</span>`;
    }
  } else {
    turnCount.innerHTML = `Attempt ${guesses.length + 1} <span>of ${MAX_ATTEMPTS}</span>`;
  }
  submitButton.disabled = gameOver || currentGuess.some((symbol) => symbol === null);

  if (gameOver) {
    selectionHint.textContent = "The secret has been revealed.";
  } else if (currentGuess.every((symbol) => symbol !== null)) {
    selectionHint.textContent = "Ready? Check your guess.";
  } else if (currentGuess.some((symbol) => symbol !== null)) {
    selectionHint.textContent = "Keep going — use a different icon in each spot.";
  } else {
    selectionHint.textContent = "Choose four different icons.";
  }
}

function chooseSymbol(symbolIndex) {
  if (gameOver) return;

  if (currentGuess.includes(symbolIndex)) {
    gameMessage.textContent = "Use each icon only once in a guess.";
    return;
  }

  let target = focusedSlot;
  if (currentGuess[target] !== null) {
    target = currentGuess.findIndex((symbol) => symbol === null);
  }
  if (target === -1) return;

  currentGuess[target] = symbolIndex;
  const nextEmpty = currentGuess.findIndex((symbol) => symbol === null);
  focusedSlot = nextEmpty === -1 ? target : nextEmpty;
  gameMessage.textContent = "";
  render();
}

function submitGuess() {
  if (gameOver || currentGuess.some((symbol) => symbol === null)) return;

  const score = scoreGuess(currentGuess, secret);
  guesses.push({ symbols: [...currentGuess], score });
  currentGuess = Array(CODE_LENGTH).fill(null);
  focusedSlot = 0;

  if (score.exact === CODE_LENGTH) {
    gameOver = true;
    gameMessage.textContent = `You cracked the code in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}!`;
  } else if (guesses.length === MAX_ATTEMPTS) {
    gameOver = true;
    gameMessage.textContent = "That was your last try. Here's the secret code.";
  } else {
    gameMessage.textContent = `${score.exact} in the right spot · ${score.misplaced} in another spot`;
  }

  render();
}

function startNewGame() {
  secret = createSecret();
  guesses = [];
  currentGuess = Array(CODE_LENGTH).fill(null);
  focusedSlot = 0;
  gameOver = false;
  gameMessage.textContent = "";
  renderTray();
  render();
}

submitButton.addEventListener("click", submitGuess);
newGameButton.addEventListener("click", startNewGame);
challengeSize.addEventListener("change", startNewGame);

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLSelectElement) return;

  if (/^[0-9]$/.test(event.key) && !event.repeat) {
    const symbolIndex = event.key === "0" ? 9 : Number(event.key) - 1;
    if (symbolIndex < availableSymbols.length) {
      chooseSymbol(availableSymbols[symbolIndex]);
    }
  } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
    submitGuess();
  } else if (event.key === "Backspace" && !gameOver) {
    event.preventDefault();
    const target = currentGuess[focusedSlot] === null
      ? [...currentGuess].map((symbol, index) => symbol === null ? -1 : index).filter((index) => index !== -1).at(-1)
      : focusedSlot;
    if (target !== undefined && target !== -1) {
      currentGuess[target] = null;
      focusedSlot = target;
      gameMessage.textContent = "";
      render();
    }
  }
});

startNewGame();
