import test from 'node:test';
import assert from 'node:assert/strict';
import { cases, getCase } from '../data.mjs';
import { evaluateAnswer, createReport, normalizeText, MAX_ANSWER_LENGTH } from '../evaluator.mjs';

for (const item of cases) {
  test(`${item.id}: grounded fixture passes configured checks`, () => {
    const result = evaluateAnswer(item, item.fixtures.grounded);
    assert.equal(result.status, 'checks_passed');
    assert.equal(result.score, 100);
    assert.equal(result.flaggedClaims.length, 0);
  });
  test(`${item.id}: risky fixture is flagged despite a real source ID`, () => {
    const result = evaluateAnswer(item, item.fixtures.risky);
    assert.equal(result.status, 'needs_review');
    assert.ok(result.flaggedClaims.length > 0);
    assert.ok(result.score < 100);
    assert.equal(result.citations.passed, true);
  });
}

test('blank answers cannot earn points or pass', () => {
  for (const answer of ['', '  \n\t  ']) {
    const result = evaluateAnswer(cases[0], answer);
    assert.equal(result.status, 'empty');
    assert.equal(result.score, 0);
  }
});

test('source identifiers are case insensitive and deduplicated', () => {
  const answer = `${cases[0].fixtures.grounded.toLowerCase()} [ship-01]`;
  const result = evaluateAnswer(cases[0], answer);
  assert.deepEqual(result.citations.valid, ['SHIP-01']);
  assert.equal(result.score, 100);
});

test('unknown or wrong-case source IDs prevent passing', () => {
  const result = evaluateAnswer(cases[0], `${cases[0].fixtures.grounded} [WARRANTY-02] [FAKE-99]`);
  assert.equal(result.status, 'needs_review');
  assert.equal(result.citations.passed, false);
  assert.deepEqual(result.citations.unknown, ['WARRANTY-02', 'FAKE-99']);
  assert.equal(result.score, 25);
});

test('correct phrases without citations need review', () => {
  const answer = cases[0].fixtures.grounded.replace('[SHIP-01]', '');
  const result = evaluateAnswer(cases[0], answer);
  assert.equal(result.score, 75);
  assert.equal(result.status, 'needs_review');
});

test('a citation alone is not enough to pass', () => {
  const result = evaluateAnswer(cases[0], '[SHIP-01]');
  assert.equal(result.score, 25);
  assert.equal(result.status, 'needs_review');
  assert.ok(result.requiredChecks.every(check => !check.passed));
});

test('incorrect longer numbers cannot match 2–4 delivery days', () => {
  const answer = cases[0].fixtures.grounded.replace('2–4', '12–4');
  const result = evaluateAnswer(cases[0], answer);
  assert.equal(result.requiredChecks.find(check => check.id === 'delivery').passed, false);
  assert.equal(result.status, 'needs_review');
});

test('typographic apostrophes and dash variants normalise consistently', () => {
  assert.equal(normalizeText('  can’t\t confirm  2—4 '), "can't confirm 2-4");
  const item = getCase('missing-info');
  assert.equal(evaluateAnswer(item, item.fixtures.grounded.replace('cannot', 'can’t')).score, 100);
});

test('uncertainty with no helpful next step fails the abstention case', () => {
  const result = evaluateAnswer(getCase('missing-info'), 'I cannot confirm voltage compatibility. [DEVICE-03]');
  assert.equal(result.status, 'needs_review');
  assert.equal(result.requiredChecks.find(check => check.id === 'next-step').passed, false);
});

test('acknowledging uncertainty does not cancel a contradictory assertion', () => {
  const item = getCase('missing-info');
  const result = evaluateAnswer(item, `${item.fixtures.grounded} It is compatible with 110 V.`);
  assert.equal(result.status, 'needs_review');
  assert.ok(result.flaggedClaims.some(claim => claim.id === 'voltage-claim'));
});

test('penalties never produce a negative score', () => {
  const answer = 'We offer same-day delivery. Arrival is guaranteed. Shipping is free. [FAKE-1] [FAKE-2]';
  const result = evaluateAnswer(cases[0], answer);
  assert.equal(result.score, 0);
});

test('answer length boundary accepts the limit and rejects one character over', () => {
  assert.doesNotThrow(() => evaluateAnswer(cases[0], 'x'.repeat(MAX_ANSWER_LENGTH)));
  assert.throws(() => evaluateAnswer(cases[0], 'x'.repeat(MAX_ANSWER_LENGTH + 1)), RangeError);
});

test('invalid input types fail explicitly', () => {
  assert.throws(() => evaluateAnswer(cases[0], null), TypeError);
  assert.throws(() => evaluateAnswer(null, 'hello'), TypeError);
  assert.throws(() => createReport(cases[0], '', new Date('invalid')), TypeError);
});

test('reports retain the exact answer and synthetic source context', () => {
  const answer = `${cases[0].fixtures.grounded}\n`;
  const report = createReport(cases[0], answer, new Date('2026-09-21T10:00:00Z'));
  assert.equal(report.evaluatedAt, '2026-09-21T10:00:00.000Z');
  assert.equal(report.answer, answer);
  assert.equal(report.sourceDocuments[0].text, cases[0].documents[0].text);
  assert.equal(report.mode, 'offline-synthetic-fixture');
  assert.match(report.result.limitations, /does not establish correctness/);
  assert.deepEqual(JSON.parse(JSON.stringify(report)), report);
});

test('evaluation does not mutate shared source cases or fixtures', () => {
  const before = JSON.stringify(cases);
  for (const item of cases) createReport(item, item.fixtures.grounded);
  assert.equal(JSON.stringify(cases), before);
});

test('repeated runs are deterministic', () => {
  const first = evaluateAnswer(cases[1], cases[1].fixtures.risky);
  const second = evaluateAnswer(cases[1], cases[1].fixtures.risky);
  assert.deepEqual(first, second);
});
