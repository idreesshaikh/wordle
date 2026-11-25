export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const PUZZLE_EPOCH = '2026-01-01';
export const PUZZLE_EPOCH_NUMBER = 1;

export const CORRECT = 'correct';
export const PRESENT = 'present';
export const ABSENT = 'absent';

export const ERROR_CODES = Object.freeze({
  NOT_ENOUGH_LETTERS: 'not-enough-letters',
  LETTERS_ONLY: 'letters-only',
  NOT_IN_WORD_LIST: 'not-in-word-list',
  ALREADY_GUESSED: 'already-guessed',
  GAME_OVER: 'game-over',
});

const POSITION_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];
const STATE_PRIORITY = { [ABSENT]: 0, [PRESENT]: 1, [CORRECT]: 2 };

const ERROR_MESSAGES = {
  [ERROR_CODES.NOT_ENOUGH_LETTERS]: 'Not enough letters.',
  [ERROR_CODES.LETTERS_ONLY]: 'Use letters only.',
  [ERROR_CODES.NOT_IN_WORD_LIST]: 'Not in word list.',
  [ERROR_CODES.ALREADY_GUESSED]: 'You already guessed that word.',
  [ERROR_CODES.GAME_OVER]: 'This game is already over.',
};

export function normalizeWord(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidWordShape(word) {
  return /^[a-z]{5}$/.test(word);
}

export function scoreGuess(guess, answer) {
  const normalizedGuess = normalizeWord(guess);
  const normalizedAnswer = normalizeWord(answer);

  if (!isValidWordShape(normalizedGuess) || !isValidWordShape(normalizedAnswer)) {
    throw new TypeError('Words must be five letters.');
  }

  const scores = Array(WORD_LENGTH).fill(ABSENT);
  const remaining = new Map();

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (normalizedGuess[index] === normalizedAnswer[index]) {
      scores[index] = CORRECT;
    } else {
      const letter = normalizedAnswer[index];
      remaining.set(letter, (remaining.get(letter) ?? 0) + 1);
    }
  }

  for (let index = 0; index < WORD_LENGTH; index += 1) {
    if (scores[index] === CORRECT) continue;

    const letter = normalizedGuess[index];
    const available = remaining.get(letter) ?? 0;

    if (available > 0) {
      scores[index] = PRESENT;
      remaining.set(letter, available - 1);
    }
  }

  return scores;
}

export function buildKeyboardState(guesses) {
  const keyboard = {};

  for (const guess of guesses) {
    for (let index = 0; index < WORD_LENGTH; index += 1) {
      const letter = guess.word[index];
      const state = guess.scores[index];
      const previous = keyboard[letter];

      if (!previous || STATE_PRIORITY[state] > STATE_PRIORITY[previous]) {
        keyboard[letter] = state;
      }
    }
  }

  return keyboard;
}

export function createGame({
  mode = 'daily',
  answer,
  dateKey = null,
  puzzleNumber = null,
  id = null,
} = {}) {
  const normalizedAnswer = normalizeWord(answer);

  if (!isValidWordShape(normalizedAnswer)) {
    throw new TypeError('A game needs a five-letter answer.');
  }

  return {
    mode,
    answer: normalizedAnswer,
    dateKey,
    puzzleNumber,
    id,
    guesses: [],
    status: 'playing',
    completedAt: null,
    statsRecorded: false,
  };
}

export function addGuess(game, rawGuess, allowedWords) {
  if (game.status !== 'playing') {
    return { game, error: ERROR_CODES.GAME_OVER, result: null };
  }

  const word = normalizeWord(rawGuess);

  if (word.length !== WORD_LENGTH) {
    return { game, error: ERROR_CODES.NOT_ENOUGH_LETTERS, result: null };
  }

  if (!isValidWordShape(word)) {
    return { game, error: ERROR_CODES.LETTERS_ONLY, result: null };
  }

  if (!allowedWords.has(word)) {
    return { game, error: ERROR_CODES.NOT_IN_WORD_LIST, result: null };
  }

  if (game.guesses.some((guess) => guess.word === word)) {
    return { game, error: ERROR_CODES.ALREADY_GUESSED, result: null };
  }

  const scores = scoreGuess(word, game.answer);
  const guesses = [...game.guesses, { word, scores }];
  const won = word === game.answer;
  const lost = !won && guesses.length >= MAX_GUESSES;
  const status = won ? 'won' : lost ? 'lost' : 'playing';

  const nextGame = {
    ...game,
    guesses,
    status,
    completedAt: status === 'playing' ? null : Date.now(),
    statsRecorded: false,
  };

  return {
    game: nextGame,
    error: null,
    result: {
      word,
      scores,
      won,
      lost,
      keyboard: buildKeyboardState(guesses),
    },
  };
}

export function getTileLabel(rowIndex, columnIndex, letter = '', state = null) {
  const position = POSITION_LABELS[columnIndex] ?? `${columnIndex + 1}th`;
  const content = letter ? letter.toUpperCase() : 'empty';
  let label = `${position} letter, ${content}`;

  if (state) {
    label += state === PRESENT ? ', present in another position' : `, ${state}`;
  }

  return label;
}

export function getKeyLabel(letter, state = null) {
  if (!state) return `add ${letter}`;
  return `${letter} ${state === PRESENT ? 'present' : state}`;
}

export function getGuessAnnouncement(word, scores) {
  return [...word]
    .map((letter, index) => {
      const state = scores[index];
      const spoken =
        state === PRESENT ? 'present in another position' : state;
      return `${letter.toUpperCase()} ${spoken}`;
    })
    .join('. ') + '.';
}

export function getErrorMessage(code) {
  return ERROR_MESSAGES[code] ?? 'That guess could not be submitted.';
}

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateKeyToTimestamp(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getPuzzleNumber(
  date = new Date(),
  epoch = PUZZLE_EPOCH,
  epochNumber = PUZZLE_EPOCH_NUMBER,
) {
  const dateKey = typeof date === 'string' ? date : toLocalDateKey(date);
  const days = Math.round(
    (dateKeyToTimestamp(dateKey) - dateKeyToTimestamp(epoch)) / 86_400_000,
  );
  return days + epochNumber;
}

export function getDailyAnswer(
  date = new Date(),
  answers,
  epoch = PUZZLE_EPOCH,
) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new TypeError('A non-empty answer list is required.');
  }

  const puzzleNumber = getPuzzleNumber(date, epoch);
  const index =
    ((puzzleNumber - PUZZLE_EPOCH_NUMBER) % answers.length + answers.length) %
    answers.length;
  return answers[index];
}

export function pickPracticeAnswer(answers, { avoid = null, random = Math.random } = {}) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new TypeError('A non-empty answer list is required.');
  }

  const candidates = answers.filter((answer) => answer !== avoid);
  const pool = candidates.length > 0 ? candidates : answers;
  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);
  return pool[index];
}

export function createEmptyStats() {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPuzzleNumber: 0,
    lastResult: null,
  };
}

export function recordDailyResult(
  stats,
  { puzzleNumber, won, guessCount },
) {
  if (
    stats.lastPuzzleNumber === puzzleNumber &&
    stats.lastResult?.puzzleNumber === puzzleNumber
  ) {
    return stats;
  }

  const played = stats.played + 1;
  const wins = stats.wins + (won ? 1 : 0);
  const distribution = [...stats.distribution];

  if (won) {
    const index = Math.min(Math.max(guessCount - 1, 0), MAX_GUESSES - 1);
    distribution[index] += 1;
  }

  let currentStreak = 0;
  if (won) {
    const continued =
      stats.lastPuzzleNumber === puzzleNumber - 1 && stats.lastResult?.won;
    currentStreak = continued ? stats.currentStreak + 1 : 1;
  }

  return {
    ...stats,
    played,
    wins,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
    lastPuzzleNumber: puzzleNumber,
    lastResult: { puzzleNumber, won, guessCount },
  };
}

export function getWinRate(stats) {
  if (!stats.played) return 0;
  return Math.round((stats.wins / stats.played) * 100);
}

export function getDistributionMax(stats) {
  return Math.max(1, ...stats.distribution);
}

export function getCountdown(now = new Date()) {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatPuzzleNumber(puzzleNumber) {
  return new Intl.NumberFormat('en-US').format(puzzleNumber);
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getShareText(
  game,
  { highContrast = false } = {},
) {
  if (game.status === 'playing') return '';

  const symbols = highContrast
    ? { [CORRECT]: '🟦', [PRESENT]: '🟧', [ABSENT]: '⬛' }
    : { [CORRECT]: '🟩', [PRESENT]: '🟨', [ABSENT]: '⬛' };

  const score = game.status === 'won' ? game.guesses.length : 'X';
  const label =
    game.mode === 'practice'
      ? 'Wordle Practice'
      : `Wordle ${formatPuzzleNumber(game.puzzleNumber)}`;
  const rows = game.guesses.map((guess) =>
    guess.scores.map((state) => symbols[state]).join(''),
  );

  return `${label} ${score}/${MAX_GUESSES}\n\n${rows.join('\n')}`;
}
