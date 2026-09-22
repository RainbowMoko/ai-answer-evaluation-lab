export const EVALUATOR_VERSION = '1.0.0';
export const MAX_ANSWER_LENGTH = 10000;

export function normalizeText(text) {
  return text.normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\t ]+/g, ' ').trim();
}

/** Runs only the explicit patterns in a case. This does not infer truth or entailment. */
export function evaluateAnswer(testCase, answer) {
  if (!testCase || !Array.isArray(testCase.rules) || !Array.isArray(testCase.documents) || !Array.isArray(testCase.unsupportedRules)) {
    throw new TypeError('A valid evaluation case is required.');
  }
  if (typeof answer !== 'string') throw new TypeError('Answer must be a string.');
  if (answer.length > MAX_ANSWER_LENGTH) throw new RangeError(`Answer must be at most ${MAX_ANSWER_LENGTH} characters.`);
  const normalized = normalizeText(answer);
  const requiredChecks = testCase.rules.map(rule => ({ id: rule.id, label: rule.label, passed: new RegExp(rule.pattern, 'i').test(normalized) }));
  const flaggedClaims = testCase.unsupportedRules.filter(rule => new RegExp(rule.pattern, 'i').test(normalized)).map(({ id, label }) => ({ id, label }));
  const citations = [...new Set([...normalized.matchAll(/\[([a-z][a-z0-9]*-\d+)\]/gi)].map(match => match[1].toUpperCase()))];
  const allowedIds = new Set(testCase.documents.map(doc => doc.id.toUpperCase()));
  const validCitations = citations.filter(id => allowedIds.has(id));
  const unknownCitations = citations.filter(id => !allowedIds.has(id));
  const citationPassed = validCitations.length > 0 && unknownCitations.length === 0;
  const expectedPoints = testCase.rules.length ? Math.round(75 * requiredChecks.filter(rule => rule.passed).length / testCase.rules.length) : 0;
  const citationPoints = citationPassed ? 25 : 0;
  const penalty = Math.min(100, 25 * (flaggedClaims.length + unknownCitations.length));
  const score = normalized ? Math.max(0, expectedPoints + citationPoints - penalty) : 0;
  const allRequiredPassed = requiredChecks.length > 0 && requiredChecks.every(rule => rule.passed);
  const status = !normalized ? 'empty' : allRequiredPassed && citationPassed && flaggedClaims.length === 0 ? 'checks_passed' : 'needs_review';
  return {
    evaluatorVersion: EVALUATOR_VERSION,
    caseId: testCase.id,
    status,
    score,
    scoreBreakdown: { expectedPoints, citationPoints, penalty },
    requiredChecks,
    flaggedClaims,
    citations: { passed: citationPassed, valid: validCitations, unknown: unknownCitations },
    limitations: 'This is a narrow pattern-based check of a synthetic example. A passing score does not establish correctness, safety, or support for every claim. Citations are checked for identifier presence, not whether the source entails the answer.'
  };
}

export function createReport(testCase, answer, evaluatedAt = new Date()) {
  if (!(evaluatedAt instanceof Date) || Number.isNaN(evaluatedAt.getTime())) throw new TypeError('A valid evaluation date is required.');
  return {
    schemaVersion: 1,
    project: 'AI Answer Evaluation Lab',
    mode: 'offline-synthetic-fixture',
    evaluatedAt: evaluatedAt.toISOString(),
    question: testCase.question,
    answer,
    sourceDocuments: testCase.documents.map(document => ({ ...document })),
    result: evaluateAnswer(testCase, answer)
  };
}
