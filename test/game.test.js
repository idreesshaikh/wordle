import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ABSENT,
  CORRECT,
  ERROR_CODES,
  MAX_GUESSES,
  PRESENT,
  addGuess,
  buildKeyboardState,
  createEmptyStats,
  createGame,
  formatCountdown,
  getDailyAnswer,
  getDistributionMax,
  getErrorMessage,
  getGuessAnnouncement,
  getKeyLabel,
  getPuzzleNumber,
  getShareText,
  getTileLabel,
  getWinRate,
  normalizeWord,
  pickPracticeAnswer,
  recordDailyResult,
  scoreGuess,
  toLocalDateKey,
} from '../js/game.js';

test('normalizeWord trims and lowercases', () => {
  assert.equal(normalizeWord('  CrAnE '), 'crane');
  assert.equal(normalizeWord(null), '');
});

test('scoreGuess marks exact matches', () => {
  assert.deepEqual(scoreGuess('crane', 'crane'), [
    CORRECT,
    CORRECT,
    CORRECT,
    CORRECT,
    CORRECT,
  ]);
});

test('scoreGuess marks present and absent letters', () => {
  assert.deepEqual(scoreGuess('crane', 'under'), [
    ABSENT,
    PRESENT,
    ABSENT,
    PRESENT,
    PRESENT,
  ]);
  assert.deepEqual(scoreGuess('crane', 'storm'), [
    ABSENT,
    PRESENT,
    ABSENT,
    ABSENT,
    ABSENT,
  ]);
});

test('scoreGuess gives exact matches priority over present matches', () => {
  assert.deepEqual(scoreGuess('alley', 'apple'), [
    CORRECT,
    PRESENT,
    ABSENT,
    PRESENT,
    ABSENT,
  ]);
});

test('scoreGuess does not reuse answer letters', () => {
  assert.deepEqual(scoreGuess('eerie', 'there'), [
    PRESENT,
    ABSENT,
    PRESENT,
    ABSENT,
    CORRECT,
  ]);
  assert.deepEqual(scoreGuess('sassy', 'class'), [
    PRESENT,
    PRESENT,
    ABSENT,
    CORRECT,
    ABSENT,
  ]);
});

test('scoreGuess rejects malformed words', () => {
  assert.throws(() => scoreGuess('four', 'crane'), TypeError);
  assert.throws(() => scoreGuess('cr4ne', 'crane'), TypeError);
});

test('buildKeyboardState keeps the strongest state per letter', () => {
  const guesses = [
    { word: 'crane', scores: [ABSENT, PRESENT, ABSENT, PRESENT, PRESENT] },
    { word: 'eerie', scores: [CORRECT, ABSENT, ABSENT, CORRECT, CORRECT] },
  ];

  assert.deepEqual(buildKeyboardState(guesses), {
    c: ABSENT,
    r: PRESENT,
    a: ABSENT,
    n: PRESENT,
    e: CORRECT,
    i: CORRECT,
  });
});

test('addGuess creates a valid game row', () => {
  const game = createGame({ answer: 'crane' });
  const { game: next, error, result } = addGuess(
    game,
    'storm',
    new Set(['storm']),
  );

  assert.equal(error, null);
  assert.equal(next.guesses.length, 1);
  assert.equal(next.status, 'playing');
  assert.deepEqual(result.scores, [ABSENT, ABSENT, ABSENT, PRESENT, ABSENT]);
  assert.deepEqual(result.keyboard, {
    s: ABSENT,
    t: ABSENT,
    o: ABSENT,
    r: PRESENT,
    m: ABSENT,
  });
});

test('addGuess wins on the correct answer', () => {
  const game = createGame({ answer: 'crane' });
  const { game: next, result } = addGuess(game, 'CRANE', new Set(['crane']));

  assert.equal(next.status, 'won');
  assert.equal(result.won, true);
  assert.equal(result.lost, false);
  assert.ok(next.completedAt);
});

test('addGuess loses after six wrong guesses', () => {
  let game = createGame({ answer: 'crane' });
  const guesses = ['about', 'brisk', 'dwelt', 'flown', 'grasp', 'jumpy'];

  for (const guess of guesses) {
    ({ game } = addGuess(game, guess, new Set(guesses)));
  }

  assert.equal(game.guesses.length, MAX_GUESSES);
  assert.equal(game.status, 'lost');
});

test('addGuess rejects invalid and repeated guesses', () => {
  const allowed = new Set(['crane', 'storm']);
  const game = createGame({ answer: 'crane' });

  assert.equal(addGuess(game, 'four', allowed).error, ERROR_CODES.NOT_ENOUGH_LETTERS);
  assert.equal(addGuess(game, 'cr4ne', allowed).error, ERROR_CODES.LETTERS_ONLY);
  assert.equal(addGuess(game, 'brick', allowed).error, ERROR_CODES.NOT_IN_WORD_LIST);

  const { game: afterGuess } = addGuess(game, 'storm', allowed);
  assert.equal(addGuess(afterGuess, 'storm', allowed).error, ERROR_CODES.ALREADY_GUESSED);
});

test('addGuess rejects guesses after the game ends', () => {
  let game = createGame({ answer: 'crane' });
  ({ game } = addGuess(game, 'crane', new Set(['crane'])));

  assert.equal(addGuess(game, 'storm', new Set(['storm'])).error, ERROR_CODES.GAME_OVER);
});

test('tile labels mirror observed accessibility language', () => {
  assert.equal(getTileLabel(0, 0, '', null), '1st letter, empty');
  assert.equal(getTileLabel(0, 2, 'c', null), '3rd letter, C');
  assert.equal(
    getTileLabel(0, 1, 'r', PRESENT),
    '2nd letter, R, present in another position',
  );
  assert.equal(getTileLabel(0, 0, 'c', ABSENT), '1st letter, C, absent');
  assert.equal(getTileLabel(0, 0, 'c', CORRECT), '1st letter, C, correct');
});

test('keyboard labels mirror observed accessibility language', () => {
  assert.equal(getKeyLabel('q'), 'add q');
  assert.equal(getKeyLabel('e', PRESENT), 'e present');
  assert.equal(getKeyLabel('c', ABSENT), 'c absent');
  assert.equal(getKeyLabel('r', CORRECT), 'r correct');
});

test('guess announcements speak every tile state', () => {
  assert.equal(
    getGuessAnnouncement('crane', [ABSENT, PRESENT, ABSENT, PRESENT, PRESENT]),
    'C absent. R present in another position. A absent. N present in another position. E present in another position.',
  );
});

test('error messages are human readable', () => {
  assert.equal(getErrorMessage(ERROR_CODES.NOT_ENOUGH_LETTERS), 'Not enough letters.');
  assert.equal(getErrorMessage('unknown'), 'That guess could not be submitted.');
});

test('local date keys do not drift with timezone', () => {
  assert.equal(toLocalDateKey(new Date(2026, 10, 24, 12, 0, 0)), '2026-11-24');
  assert.equal(toLocalDateKey(new Date(2026, 0, 1, 0, 0, 0)), '2026-01-01');
});

test('puzzle numbers count from the project epoch', () => {
  assert.equal(getPuzzleNumber(new Date(2026, 0, 1, 12)), 1);
  assert.equal(getPuzzleNumber(new Date(2026, 0, 2, 12)), 2);
  assert.equal(getPuzzleNumber(new Date(2026, 10, 24, 12)), 328);
  assert.equal(getPuzzleNumber(new Date(2027, 0, 1, 12)), 366);
});

test('daily answers are deterministic and wrap safely', () => {
  const answers = ['alpha', 'bravo', 'cider'];
  assert.equal(getDailyAnswer(new Date(2026, 0, 1, 12), answers), 'alpha');
  assert.equal(getDailyAnswer(new Date(2026, 0, 2, 12), answers), 'bravo');
  assert.equal(getDailyAnswer(new Date(2026, 0, 4, 12), answers), 'alpha');
  assert.equal(getDailyAnswer('2026-11-24', answers), answers[327 % 3]);
});

test('practice answers avoid the previous answer when possible', () => {
  const answers = ['alpha', 'bravo', 'cider'];
  assert.equal(pickPracticeAnswer(answers, { avoid: 'alpha', random: () => 0 }), 'bravo');
  assert.equal(pickPracticeAnswer(['alpha'], { avoid: 'alpha', random: () => 0 }), 'alpha');
});

test('empty stats are stable', () => {
  assert.deepEqual(createEmptyStats(), {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPuzzleNumber: 0,
    lastResult: null,
  });
});

test('recordDailyResult tracks wins, streaks, and distribution', () => {
  let stats = createEmptyStats();

  stats = recordDailyResult(stats, { puzzleNumber: 1, won: true, guessCount: 3 });
  stats = recordDailyResult(stats, { puzzleNumber: 2, won: true, guessCount: 4 });
  stats = recordDailyResult(stats, { puzzleNumber: 3, won: false, guessCount: 6 });

  assert.equal(stats.played, 3);
  assert.equal(stats.wins, 2);
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.maxStreak, 2);
  assert.deepEqual(stats.distribution, [0, 0, 1, 1, 0, 0]);
});

test('recordDailyResult resets a streak after a missed day', () => {
  let stats = createEmptyStats();
  stats = recordDailyResult(stats, { puzzleNumber: 1, won: true, guessCount: 2 });
  stats = recordDailyResult(stats, { puzzleNumber: 3, won: true, guessCount: 2 });

  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.maxStreak, 1);
});

test('recordDailyResult is idempotent for the same puzzle', () => {
  const first = recordDailyResult(createEmptyStats(), {
    puzzleNumber: 7,
    won: true,
    guessCount: 2,
  });
  const second = recordDailyResult(first, {
    puzzleNumber: 7,
    won: true,
    guessCount: 2,
  });

  assert.equal(second.played, 1);
  assert.equal(second.distribution[1], 1);
});

test('stats helpers calculate win rate and chart scale', () => {
  const stats = {
    ...createEmptyStats(),
    played: 4,
    wins: 3,
    distribution: [0, 1, 2, 0, 0, 0],
  };

  assert.equal(getWinRate(stats), 75);
  assert.equal(getWinRate(createEmptyStats()), 0);
  assert.equal(getDistributionMax(stats), 2);
  assert.equal(getDistributionMax(createEmptyStats()), 1);
});

test('share text is spoiler-free and uses the right grid', () => {
  let game = createGame({
    mode: 'daily',
    answer: 'storm',
    puzzleNumber: 328,
    dateKey: '2026-11-24',
  });
  const allowed = new Set(['crane', 'storm']);

  ({ game } = addGuess(game, 'crane', allowed));
  ({ game } = addGuess(game, 'storm', allowed));

  assert.equal(
    getShareText(game),
    'Wordle 328 2/6\n\n⬛🟨⬛⬛⬛\n🟩🟩🟩🟩🟩',
  );
  assert.equal(
    getShareText(game, { highContrast: true }),
    'Wordle 328 2/6\n\n⬛🟧⬛⬛⬛\n🟦🟦🟦🟦🟦',
  );
});

test('share text marks a loss and labels practice', () => {
  let game = createGame({ mode: 'practice', answer: 'crane', id: 'p1' });
  const wrong = ['about', 'brisk', 'dwelt', 'flown', 'grasp', 'jumpy'];
  const allowed = new Set(wrong);

  for (const word of wrong) {
    ({ game } = addGuess(game, word, allowed));
  }

  const text = getShareText(game);
  assert.match(text, /^Wordle Practice X\/6\n\n/);
  assert.equal(text.split('\n\n')[1].split('\n').length, 6);
});

test('share text is empty while the game is in progress', () => {
  const game = createGame({ answer: 'crane' });
  assert.equal(getShareText(game), '');
});

test('countdown formatting is stable', () => {
  assert.equal(formatCountdown(0), '00:00:00');
  assert.equal(formatCountdown(59_000), '00:00:59');
  assert.equal(formatCountdown(3_661_000), '01:01:01');
});
