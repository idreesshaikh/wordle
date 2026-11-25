import {
  ALLOWED_GUESSES,
  ANSWERS,
} from './words.js';
import {
  MAX_GUESSES,
  addGuess,
  buildKeyboardState,
  createEmptyStats,
  createGame,
  formatCountdown,
  formatDate,
  formatPuzzleNumber,
  getCountdown,
  getDailyAnswer,
  getDistributionMax,
  getErrorMessage,
  getGuessAnnouncement,
  getKeyLabel,
  getPuzzleNumber,
  getShareText,
  getTileLabel,
  getWinRate,
  isValidWordShape,
  normalizeWord,
  pickPracticeAnswer,
  recordDailyResult,
  scoreGuess,
  toLocalDateKey,
} from './game.js';

const STORAGE = Object.freeze({
  daily: 'wordle-clone:daily:v1',
  practice: 'wordle-clone:practice:v1',
  stats: 'wordle-clone:stats:v1',
  settings: 'wordle-clone:settings:v1',
  mode: 'wordle-clone:mode:v1',
  helpSeen: 'wordle-clone:help-seen:v1',
});

const DEFAULT_SETTINGS = Object.freeze({
  theme: 'system',
  highContrast: false,
  reduceMotion: false,
});

const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

const boardEl = document.querySelector('#board');
const keyboardEl = document.querySelector('#keyboard');
const gameStatusEl = document.querySelector('#game-status');
const puzzleDateEl = document.querySelector('#puzzle-date');
const puzzleNumberEl = document.querySelector('#puzzle-number');
const resultStripEl = document.querySelector('#result-strip');
const resultStripTextEl = document.querySelector('#result-strip-text');
const keyboardNoteEl = document.querySelector('#keyboard-note');
const toastEl = document.querySelector('#toast');
const modeSwitchEl = document.querySelector('.mode-switch');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const helpDialog = document.querySelector('#help-dialog');
const statsDialog = document.querySelector('#stats-dialog');
const settingsDialog = document.querySelector('#settings-dialog');
const resultDialog = document.querySelector('#result-dialog');
const statPlayedEl = document.querySelector('#stat-played');
const statWinRateEl = document.querySelector('#stat-win-rate');
const statStreakEl = document.querySelector('#stat-streak');
const statMaxStreakEl = document.querySelector('#stat-max-streak');
const distributionListEl = document.querySelector('#distribution-list');
const distributionEmptyEl = document.querySelector('#distribution-empty');
const statsCountdownEl = document.querySelector('#stats-countdown');
const resultTitleEl = document.querySelector('#result-title');
const resultMetaEl = document.querySelector('#result-meta');
const resultAnswerEl = document.querySelector('#result-answer');
const resultGridEl = document.querySelector('#result-grid');
const resultLinksEl = document.querySelector('#result-links');
const receiptStatusEl = document.querySelector('#receipt-status');
const resultCountdownEl = document.querySelector('#result-countdown');
const shareButton = document.querySelector('#share-button');
const resultStatsButton = document.querySelector('#result-stats-button');
const practiceNextButton = document.querySelector('#practice-next');
const playDailyButton = document.querySelector('#play-daily');
const openResultButton = document.querySelector('#open-result');
const themeInputs = [...document.querySelectorAll('input[name="theme"]')];
const contrastToggle = document.querySelector('#contrast-toggle');
const motionToggle = document.querySelector('#motion-toggle');
const themeColorMeta = document.querySelector('#theme-color-meta');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const now = new Date();
let currentDailyKey = toLocalDateKey(now);
let todayPuzzleNumber = getPuzzleNumber(now);
let settings = loadSettings();
let stats = loadStats();
let activeMode = loadMode();
let dailyGame = loadDailyGame(now);
let practiceGame = loadPracticeGame();
let typed = [];
let inputLocked = false;
let toastTimer = 0;
let revealTimer = 0;
let resultOpenTimer = 0;
let shareResetTimer = 0;
let celebrationTimer = 0;
let announcementTimer = 0;

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readJSON(key) {
  const raw = safeGet(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveJSON(key, value) {
  try {
    safeSet(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function isGameState(value) {
  return value === 'correct' || value === 'present' || value === 'absent';
}

function loadMode() {
  const saved = safeGet(STORAGE.mode);
  return saved === 'practice' ? 'practice' : 'daily';
}

function loadSettings() {
  const raw = readJSON(STORAGE.settings);
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };

  return {
    theme: ['system', 'light', 'dark'].includes(raw.theme)
      ? raw.theme
      : DEFAULT_SETTINGS.theme,
    highContrast: Boolean(raw.highContrast),
    reduceMotion: Boolean(raw.reduceMotion),
  };
}

function loadStats() {
  const raw = readJSON(STORAGE.stats);
  if (!raw || typeof raw !== 'object') return createEmptyStats();

  const distribution =
    Array.isArray(raw.distribution) && raw.distribution.length === 6
      ? raw.distribution.map((value) => (isNonNegativeInteger(value) ? value : 0))
      : [0, 0, 0, 0, 0, 0];

  const played = isNonNegativeInteger(raw.played) ? raw.played : 0;
  const wins = Math.min(
    played,
    isNonNegativeInteger(raw.wins) ? raw.wins : 0,
  );

  const lastResult =
    raw.lastResult &&
    typeof raw.lastResult === 'object' &&
    isNonNegativeInteger(raw.lastResult.puzzleNumber) &&
    typeof raw.lastResult.won === 'boolean' &&
    Number.isInteger(raw.lastResult.guessCount)
      ? {
          puzzleNumber: raw.lastResult.puzzleNumber,
          won: raw.lastResult.won,
          guessCount: raw.lastResult.guessCount,
        }
      : null;

  return {
    played,
    wins,
    currentStreak: isNonNegativeInteger(raw.currentStreak)
      ? raw.currentStreak
      : 0,
    maxStreak: isNonNegativeInteger(raw.maxStreak) ? raw.maxStreak : 0,
    distribution,
    lastPuzzleNumber: isNonNegativeInteger(raw.lastPuzzleNumber)
      ? raw.lastPuzzleNumber
      : 0,
    lastResult,
  };
}

function saveStats() {
  saveJSON(STORAGE.stats, stats);
}

function saveSettings() {
  saveJSON(STORAGE.settings, settings);
}

function saveMode() {
  safeSet(STORAGE.mode, activeMode);
}

function saveGame(game) {
  if (!game) return;
  saveJSON(game.mode === 'daily' ? STORAGE.daily : STORAGE.practice, game);
}

function parseDateKey(dateKey) {
  if (typeof dateKey !== 'string') return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function randomFloat() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / 4_294_967_296;
  }

  return Math.random();
}

function makePracticeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `practice-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function createDailyGame(date = new Date()) {
  const game = createGame({
    mode: 'daily',
    answer: getDailyAnswer(date, ANSWERS),
    dateKey: toLocalDateKey(date),
    puzzleNumber: getPuzzleNumber(date),
  });
  saveGame(game);
  return game;
}

function createPracticeGame({ avoid = null } = {}) {
  const game = createGame({
    mode: 'practice',
    answer: pickPracticeAnswer(ANSWERS, { avoid, random: randomFloat }),
    id: makePracticeId(),
  });
  saveGame(game);
  return game;
}

function normalizeStoredGame(raw, mode) {
  if (!raw || typeof raw !== 'object') return null;

  const answer = normalizeWord(raw.answer);
  if (!isValidWordShape(answer)) return null;
  if (!Array.isArray(raw.guesses) || raw.guesses.length > MAX_GUESSES) {
    return null;
  }

  const guesses = [];
  const seen = new Set();

  for (const guess of raw.guesses) {
    if (!guess || typeof guess.word !== 'string') return null;
    const word = normalizeWord(guess.word);
    if (!isValidWordShape(word) || seen.has(word)) return null;
    seen.add(word);
    guesses.push({ word, scores: scoreGuess(word, answer) });
  }

  let status = 'playing';
  if (guesses.some((guess) => guess.word === answer)) {
    status = 'won';
  } else if (guesses.length >= MAX_GUESSES) {
    status = 'lost';
  }

  if (
    mode === 'daily' &&
    (!isNonNegativeInteger(raw.puzzleNumber) ||
      typeof raw.dateKey !== 'string')
  ) {
    return null;
  }

  return {
    mode,
    answer,
    dateKey: mode === 'daily' ? raw.dateKey : null,
    puzzleNumber: mode === 'daily' ? raw.puzzleNumber : null,
    id: mode === 'practice' && typeof raw.id === 'string' ? raw.id : null,
    guesses,
    status,
    completedAt:
      status === 'playing'
        ? null
        : typeof raw.completedAt === 'number'
          ? raw.completedAt
          : Date.now(),
    statsRecorded: status !== 'playing' && Boolean(raw.statsRecorded),
  };
}

function recordStatsIfNeeded(game) {
  if (
    !game ||
    game.mode !== 'daily' ||
    game.status === 'playing' ||
    game.statsRecorded
  ) {
    return game;
  }

  stats = recordDailyResult(stats, {
    puzzleNumber: game.puzzleNumber,
    won: game.status === 'won',
    guessCount: game.guesses.length,
  });
  saveStats();
  game.statsRecorded = true;
  saveGame(game);
  return game;
}

function loadDailyGame(date) {
  const raw = readJSON(STORAGE.daily);
  const stored = normalizeStoredGame(raw, 'daily');

  if (
    stored &&
    stored.dateKey === currentDailyKey &&
    stored.puzzleNumber === todayPuzzleNumber
  ) {
    return recordStatsIfNeeded(stored);
  }

  if (stored) recordStatsIfNeeded(stored);
  return createDailyGame(date);
}

function loadPracticeGame() {
  const stored = normalizeStoredGame(readJSON(STORAGE.practice), 'practice');
  if (stored) return stored;
  return createPracticeGame({ avoid: dailyGame?.answer ?? null });
}

function currentGame() {
  return activeMode === 'daily' ? dailyGame : practiceGame;
}

function shouldReduceMotion() {
  return settings.reduceMotion || reduceMotionQuery.matches;
}

function applySettings() {
  const root = document.documentElement;

  if (settings.theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = settings.theme;
  }

  root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  root.dataset.reducedMotion = settings.reduceMotion ? 'true' : 'false';
  updateThemeColor();
}

function updateThemeColor() {
  if (!themeColorMeta) return;
  const effectiveDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && darkModeQuery.matches);
  themeColorMeta.setAttribute('content', effectiveDark ? '#101310' : '#f2f3ee');
}

function syncSettingsControls() {
  for (const input of themeInputs) {
    input.checked = input.value === settings.theme;
  }
  contrastToggle.checked = settings.highContrast;
  motionToggle.checked = settings.reduceMotion;
}

function buildKeyboard() {
  keyboardEl.replaceChildren();

  for (const keys of KEY_ROWS) {
    const row = document.createElement('div');
    row.className = 'keyboard__row';

    for (const key of keys) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'key';
      button.dataset.key = key;

      if (key === 'enter') {
        button.classList.add('key--wide');
        button.textContent = 'Enter';
        button.setAttribute('aria-label', 'Submit guess');
      } else if (key === 'backspace') {
        button.classList.add('key--wide');
        button.append(createIcon('backspace'));
        button.setAttribute('aria-label', 'Delete letter');
      } else {
        button.textContent = key;
        button.setAttribute('aria-label', `add ${key}`);
      }

      button.addEventListener('click', () => handleInput(key));
      row.append(button);
    }

    keyboardEl.append(row);
  }
}

function createIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#icon-${name}`);
  svg.append(use);
  return svg;
}

function updateKeyboard() {
  const game = currentGame();
  const keyboardState = buildKeyboardState(game.guesses);
  const canPlay = game.status === 'playing' && !inputLocked;
  const canEnter = canPlay && typed.length === 5;
  const canDelete = canPlay && typed.length > 0;

  for (const key of keyboardEl.querySelectorAll('.key')) {
    const value = key.dataset.key;

    if (value === 'enter') {
      key.disabled = !canEnter;
      continue;
    }

    if (value === 'backspace') {
      key.disabled = !canDelete;
      continue;
    }

    const state = keyboardState[value] ?? null;
    if (state) {
      key.dataset.state = state;
    } else {
      delete key.dataset.state;
    }

    key.setAttribute('aria-label', getKeyLabel(value, state));
    key.setAttribute('aria-disabled', String(!canPlay));
    key.disabled = inputLocked;
  }
}

function renderBoard({ pendingRevealRow = null } = {}) {
  const game = currentGame();
  const activeRow = game.guesses.length;
  boardEl.replaceChildren();

  for (let rowIndex = 0; rowIndex < MAX_GUESSES; rowIndex += 1) {
    const row = document.createElement('div');
    row.className = 'board__row';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', `Row ${rowIndex + 1}`);

    if (
      game.status === 'playing' &&
      rowIndex === activeRow &&
      pendingRevealRow === null
    ) {
      row.classList.add('is-active');
    }

    const guess = game.guesses[rowIndex];
    const letters = guess
      ? guess.word
      : rowIndex === activeRow && game.status === 'playing'
        ? typed.join('')
        : '';

    for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
      const letter = letters[columnIndex] ?? '';
      const state = guess ? guess.scores[columnIndex] : null;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.setAttribute('role', 'img');
      tile.setAttribute(
        'aria-label',
        getTileLabel(rowIndex, columnIndex, letter, state),
      );
      tile.dataset.filled = String(Boolean(letter));

      if (state) tile.dataset.state = state;

      const inner = document.createElement('span');
      inner.className = 'tile__inner';

      const front = document.createElement('span');
      front.className = 'tile__face tile__face--front';
      front.textContent = letter ? letter.toUpperCase() : '';

      const back = document.createElement('span');
      back.className = 'tile__face tile__face--back';
      back.textContent = letter ? letter.toUpperCase() : '';

      inner.append(front, back);
      tile.append(inner);
      row.append(tile);

      if (guess) {
        const isPending = rowIndex === pendingRevealRow;
        tile.dataset.revealed = String(!isPending);
        if (isPending) {
          tile.style.setProperty('--delay', `${columnIndex * 88}ms`);
        }
      }
    }

    boardEl.append(row);
  }
}

function revealRow(rowIndex) {
  const row = boardEl.children[rowIndex];
  if (!row) return;

  [...row.children].forEach((tile, index) => {
    tile.style.setProperty('--delay', `${index * 88}ms`);
    tile.dataset.revealed = 'true';
  });
}

function shakeRow(rowIndex) {
  const row = boardEl.children[rowIndex];
  if (!row) return;

  row.classList.remove('is-shaking');
  void row.offsetWidth;
  row.classList.add('is-shaking');
  window.setTimeout(() => row.classList.remove('is-shaking'), 380);
}

function celebrateRow(rowIndex) {
  const row = boardEl.children[rowIndex];
  if (!row) return;

  [...row.children].forEach((tile, index) => {
    tile.style.setProperty('--pop-delay', `${index * 38}ms`);
  });
  row.classList.add('is-celebrating');
  window.clearTimeout(celebrationTimer);
  celebrationTimer = window.setTimeout(
    () => row.classList.remove('is-celebrating'),
    760,
  );
}

function announce(message) {
  window.clearTimeout(announcementTimer);
  gameStatusEl.textContent = '';
  announcementTimer = window.setTimeout(() => {
    gameStatusEl.textContent = message;
  }, 30);
}

function updateModeSwitch() {
  modeSwitchEl.dataset.active = activeMode;
  for (const button of modeButtons) {
    const isActive = button.dataset.mode === activeMode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }
}

function renderMeta() {
  if (activeMode === 'daily') {
    const date = parseDateKey(dailyGame.dateKey) ?? new Date();
    puzzleDateEl.textContent = formatDate(date);
    puzzleNumberEl.textContent = `No. ${formatPuzzleNumber(dailyGame.puzzleNumber)}`;
  } else {
    puzzleDateEl.textContent = 'Practice round';
    puzzleNumberEl.textContent = 'Unlimited';
  }
}

function updateResultStrip() {
  const game = currentGame();

  if (game.status === 'playing') {
    resultStripEl.hidden = true;
    return;
  }

  resultStripEl.hidden = false;
  const count = game.guesses.length;

  if (game.status === 'won') {
    resultStripTextEl.textContent =
      game.mode === 'practice'
        ? `Practice solved in ${count}.`
        : `Solved in ${count}.`;
  } else {
    resultStripTextEl.textContent =
      game.mode === 'practice'
        ? `Practice word: ${game.answer.toUpperCase()}.`
        : `The word was ${game.answer.toUpperCase()}.`;
  }
}

function updateKeyboardNote() {
  const game = currentGame();

  if (game.mode === 'practice') {
    keyboardNoteEl.textContent =
      game.status === 'playing'
        ? 'Practice never touches your daily stats.'
        : 'This practice round is complete.';
    return;
  }

  keyboardNoteEl.textContent =
    game.status === 'playing'
      ? 'One new word at midnight.'
      : 'Back tomorrow for a new word.';
}

function renderAll() {
  updateModeSwitch();
  renderMeta();
  renderBoard();
  updateKeyboard();
  updateResultStrip();
  updateKeyboardNote();
}

function setMode(mode) {
  if (inputLocked || mode === activeMode) return;
  if (mode === 'practice' && !practiceGame) {
    practiceGame = createPracticeGame({ avoid: dailyGame.answer });
  }

  activeMode = mode;
  typed = [];
  saveMode();
  renderAll();
}

function canSubmit() {
  return (
    currentGame().status === 'playing' &&
    !inputLocked &&
    typed.length === 5
  );
}

function handleInput(key) {
  if (inputLocked) return;

  const game = currentGame();

  if (key === 'enter') {
    if (game.status !== 'playing') return;
    submitGuess();
    return;
  }

  if (key === 'backspace') {
    if (game.status !== 'playing' || typed.length === 0) return;
    typed.pop();
    renderBoard();
    updateKeyboard();
    return;
  }

  if (!/^[a-z]$/.test(key)) return;
  if (game.status !== 'playing' || typed.length >= 5) return;

  typed.push(key);
  renderBoard();
  updateKeyboard();
}

function submitGuess() {
  const game = currentGame();

  if (game.status !== 'playing' || inputLocked) return;

  if (typed.length < 5) {
    showToast('Not enough letters.');
    shakeRow(game.guesses.length);
    return;
  }

  const guess = typed.join('');
  const outcome = addGuess(game, guess, ALLOWED_GUESSES);

  if (outcome.error) {
    showToast(getErrorMessage(outcome.error));
    shakeRow(game.guesses.length);
    return;
  }

  const nextGame = recordStatsIfNeeded(outcome.game);
  if (activeMode === 'daily') {
    dailyGame = nextGame;
  } else {
    practiceGame = nextGame;
  }
  saveGame(nextGame);

  typed = [];
  inputLocked = true;
  const rowIndex = nextGame.guesses.length - 1;

  renderBoard({ pendingRevealRow: rowIndex });
  updateKeyboard();
  updateKeyboardNote();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => revealRow(rowIndex));
  });

  const duration = shouldReduceMotion() ? 0 : 460 + 88 * 4 + 70;
  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(
    () => finishReveal(outcome.result, rowIndex),
    duration,
  );
}

function finishReveal(result, rowIndex) {
  inputLocked = false;
  updateKeyboard();
  updateKeyboardNote();
  updateResultStrip();

  if (result.won) {
    celebrateRow(rowIndex);
    announce(`Correct. Solved in ${currentGame().guesses.length}.`);
  } else if (result.lost) {
    announce(`Not this time. The word was ${currentGame().answer.toUpperCase()}.`);
  } else {
    announce(`${getGuessAnnouncement(result.word, result.scores)} Next guess.`);
  }

  if (result.won || result.lost) {
    window.clearTimeout(resultOpenTimer);
    resultOpenTimer = window.setTimeout(() => {
      if (!document.querySelector('dialog[open]')) {
        openDialog(resultDialog);
      }
    }, shouldReduceMotion() ? 60 : 280);
  }
}

function hideToast() {
  window.clearTimeout(toastTimer);
  toastEl.classList.remove('is-visible');
}

function showToast(message) {
  if (!message) return;
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideToast, 2400);
}

function openDialog(dialog) {
  if (!dialog || dialog.open) return;

  hideToast();

  for (const other of document.querySelectorAll('dialog[open]')) {
    if (other !== dialog) other.close();
  }

  if (dialog === statsDialog) renderStats();
  if (dialog === settingsDialog) syncSettingsControls();
  if (dialog === resultDialog) {
    if (currentGame().status === 'playing') return;
    renderResult();
  }

  dialog.showModal();
  const card = dialog.querySelector('.modal__card');
  if (card) card.scrollTop = 0;
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function renderStats() {
  const game = dailyGame;
  const todayGuess =
    stats.lastResult?.puzzleNumber === game.puzzleNumber &&
    stats.lastResult?.won
      ? stats.lastResult.guessCount
      : null;

  statPlayedEl.textContent = String(stats.played);
  statWinRateEl.textContent = `${getWinRate(stats)}%`;
  statStreakEl.textContent = String(stats.currentStreak);
  statMaxStreakEl.textContent = String(stats.maxStreak);

  const max = getDistributionMax(stats);
  distributionListEl.replaceChildren();

  stats.distribution.forEach((count, index) => {
    const item = document.createElement('li');
    item.className = 'dist';
    if (todayGuess === index + 1) item.classList.add('is-today');

    const srLabel = document.createElement('span');
    srLabel.className = 'visually-hidden';
    srLabel.textContent = `Guessed in ${index + 1}: ${count} ${
      count === 1 ? 'time' : 'times'
    }.`;

    const label = document.createElement('span');
    label.setAttribute('aria-hidden', 'true');
    label.textContent = String(index + 1);

    const track = document.createElement('span');
    track.className = 'dist__track';
    track.setAttribute('aria-hidden', 'true');

    const fill = document.createElement('span');
    fill.className = 'dist__fill';
    fill.style.setProperty('--bar-width', `${(count / max) * 100}%`);
    track.append(fill);

    const countEl = document.createElement('span');
    countEl.className = 'dist__count';
    countEl.setAttribute('aria-hidden', 'true');
    countEl.textContent = String(count);

    item.append(srLabel, label, track, countEl);
    distributionListEl.append(item);
  });

  if (stats.wins === 0) {
    distributionEmptyEl.hidden = false;
    distributionEmptyEl.textContent = stats.played
      ? 'No wins yet. A winning guess will start this chart.'
      : 'Your first completed daily puzzle will start this chart.';
  } else {
    distributionEmptyEl.hidden = true;
  }

  statsCountdownEl.textContent = formatCountdown(getCountdown());
  updateCountdowns();
}

function renderResult() {
  const game = currentGame();
  if (!game || game.status === 'playing') return;

  const isPractice = game.mode === 'practice';
  const date = parseDateKey(game.dateKey);
  const count = game.guesses.length;

  resultTitleEl.textContent =
    game.status === 'won' ? `Solved in ${count}` : 'Not this time';
  resultMetaEl.textContent = isPractice
    ? 'Practice round · Unlimited'
    : `Daily No. ${formatPuzzleNumber(game.puzzleNumber)} · ${
        date ? formatShortDate(date) : ''
      }`;

  if (game.status === 'lost') {
    resultAnswerEl.hidden = false;
    const word = document.createElement('strong');
    word.textContent = game.answer.toUpperCase();
    resultAnswerEl.replaceChildren(
      document.createTextNode('The word was '),
      word,
      document.createTextNode('.'),
    );
  } else {
    resultAnswerEl.hidden = true;
    resultAnswerEl.replaceChildren();
  }

  resultGridEl.replaceChildren();
  game.guesses.forEach((guess) => {
    const row = document.createElement('div');
    row.className = 'result-grid__row';

    guess.scores.forEach((state) => {
      const cell = document.createElement('span');
      cell.className = 'result-cell';
      cell.dataset.state = state;
      row.append(cell);
    });

    resultGridEl.append(row);
  });

  if (isPractice) {
    resultCountdownEl.hidden = true;
    resultCountdownEl.textContent = '';
  } else {
    resultCountdownEl.hidden = false;
    resultCountdownEl.textContent = `Next daily puzzle in ${formatCountdown(
      getCountdown(),
    )}`;
  }

  window.clearTimeout(shareResetTimer);
  practiceNextButton.hidden = !isPractice;
  playDailyButton.hidden = !isPractice;
  resultLinksEl.hidden = !isPractice;
  shareButton.disabled = false;
  const shareLabel = shareButton.querySelector('span');
  const shareUse = shareButton.querySelector('use');
  if (shareLabel) shareLabel.textContent = 'Copy result';
  if (shareUse) shareUse.setAttribute('href', '#icon-copy');
  receiptStatusEl.textContent = 'No letters. Safe to share.';
  receiptStatusEl.removeAttribute('data-state');

  updateCountdowns();
}

function updateCountdowns() {
  const milliseconds = getCountdown();
  const text = formatCountdown(milliseconds);

  if (statsDialog.open) {
    statsCountdownEl.textContent = text;
  }

  if (resultDialog.open && currentGame().mode === 'daily') {
    resultCountdownEl.textContent = `Next daily puzzle in ${text}`;
  }
}

async function copyResult() {
  const game = currentGame();
  if (!game || game.status === 'playing') return;

  const text = getShareText(game, {
    highContrast: settings.highContrast,
  });
  if (!text) return;

  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    copied = false;
  }

  if (!copied) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      copied = document.execCommand('copy');
      textarea.remove();
    } catch {
      copied = false;
    }
  }

  const label = shareButton.querySelector('span');
  const use = shareButton.querySelector('use');

  if (copied) {
    receiptStatusEl.textContent = 'Copied. Paste it anywhere.';
    receiptStatusEl.dataset.state = 'success';
    if (label) label.textContent = 'Copied';
    if (use) use.setAttribute('href', '#icon-check');
  } else {
    receiptStatusEl.textContent =
      'Copy failed. Clipboard access was blocked.';
    receiptStatusEl.dataset.state = 'error';
    if (label) label.textContent = 'Copy failed';
  }

  window.clearTimeout(shareResetTimer);
  shareResetTimer = window.setTimeout(() => {
    if (label) label.textContent = 'Copy result';
    if (use) use.setAttribute('href', '#icon-copy');
    receiptStatusEl.textContent = 'No letters. Safe to share.';
    receiptStatusEl.removeAttribute('data-state');
  }, 2200);
}

function startNewPractice() {
  practiceGame = createPracticeGame({ avoid: practiceGame?.answer ?? null });
  activeMode = 'practice';
  typed = [];
  inputLocked = false;
  saveMode();
  closeDialog(resultDialog);
  renderAll();
  announce('New practice word ready.');
}

function checkRollover() {
  const current = new Date();
  const key = toLocalDateKey(current);

  if (key === currentDailyKey) return;

  recordStatsIfNeeded(dailyGame);
  currentDailyKey = key;
  todayPuzzleNumber = getPuzzleNumber(current);
  dailyGame = createDailyGame(current);
  typed = [];
  inputLocked = false;

  if (resultDialog.open) closeDialog(resultDialog);
  if (statsDialog.open) renderStats();

  if (activeMode === 'daily') {
    renderAll();
  } else {
    renderMeta();
  }

  if (!document.querySelector('dialog[open]')) {
    showToast('A new daily puzzle is ready.');
  }
}

function buildStaticListeners() {
  for (const button of modeButtons) {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  }

  for (const button of document.querySelectorAll('[data-open-dialog]')) {
    button.addEventListener('click', () => {
      openDialog(document.getElementById(button.dataset.openDialog));
    });
  }

  for (const button of document.querySelectorAll('[data-close-dialog]')) {
    button.addEventListener('click', () => {
      closeDialog(button.closest('dialog'));
    });
  }

  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const isOutside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (isOutside) closeDialog(dialog);
    });

    dialog.addEventListener('close', () => {
      if (dialog === helpDialog) safeSet(STORAGE.helpSeen, '1');
    });
  }

  for (const input of themeInputs) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      settings.theme = input.value;
      saveSettings();
      applySettings();
    });
  }

  contrastToggle.addEventListener('change', () => {
    settings.highContrast = contrastToggle.checked;
    saveSettings();
    applySettings();
  });

  motionToggle.addEventListener('change', () => {
    settings.reduceMotion = motionToggle.checked;
    saveSettings();
    applySettings();
  });

  openResultButton.addEventListener('click', () => openDialog(resultDialog));
  shareButton.addEventListener('click', copyResult);

  resultStatsButton.addEventListener('click', () => {
    closeDialog(resultDialog);
    openDialog(statsDialog);
  });

  practiceNextButton.addEventListener('click', startNewPractice);

  playDailyButton.addEventListener('click', () => {
    closeDialog(resultDialog);
    setMode('daily');
  });

  darkModeQuery.addEventListener('change', updateThemeColor);

  document.addEventListener('keydown', (event) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.isComposing
    ) {
      return;
    }

    if (document.querySelector('dialog[open]')) return;

    const target = event.target;
    const isInteractive =
      target instanceof Element &&
      Boolean(
        target.closest(
          'button, a, input, textarea, select, summary, [contenteditable="true"]',
        ),
      );

    if (event.key === 'Enter') {
      if (isInteractive) return;
      event.preventDefault();
      handleInput('enter');
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      handleInput('backspace');
      return;
    }

    if (/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      handleInput(event.key.toLowerCase());
    }
  });
}

function init() {
  applySettings();
  buildKeyboard();
  buildStaticListeners();

  dailyGame = recordStatsIfNeeded(dailyGame);
  practiceGame = recordStatsIfNeeded(practiceGame);

  if (!practiceGame) {
    practiceGame = createPracticeGame({ avoid: dailyGame.answer });
  }

  renderAll();

  window.setInterval(updateCountdowns, 1000);
  window.setInterval(checkRollover, 30000);

  if (!safeGet(STORAGE.helpSeen)) {
    window.setTimeout(() => {
      if (!document.querySelector('dialog[open]')) openDialog(helpDialog);
    }, 500);
  }
}

init();
