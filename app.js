import { cases } from './data.mjs';
import { createReport, MAX_ANSWER_LENGTH } from './evaluator.mjs';

const byId = id => document.getElementById(id);
const answer = byId('answer');
let activeCase = cases[0];
let currentReport = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateCount() {
  byId('char-count').textContent = `${answer.value.length.toLocaleString()} / ${MAX_ANSWER_LENGTH.toLocaleString()}`;
}

function setFixture(kind) {
  answer.value = kind ? activeCase.fixtures[kind] : '';
  byId('grounded-fixture').setAttribute('aria-pressed', String(kind === 'grounded'));
  byId('risky-fixture').setAttribute('aria-pressed', String(kind === 'risky'));
  updateCount();
  runChecks();
}

function selectCase(testCase) {
  activeCase = testCase;
  document.querySelectorAll('.case-button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseId === testCase.id)));
  byId('case-category').textContent = testCase.category;
  byId('case-title').textContent = testCase.title;
  byId('case-lesson').textContent = testCase.lesson;
  byId('question').textContent = testCase.question;
  byId('expected-behavior').textContent = testCase.expectedBehavior;
  const documents = byId('documents');
  documents.replaceChildren();
  testCase.documents.forEach(source => {
    const article = element('article', 'source-document');
    article.append(element('span', 'source-id', `[${source.id}]`), element('h4', '', source.title), element('p', '', source.text));
    documents.append(article);
  });
  byId('rule-source').textContent = JSON.stringify({ required: testCase.rules, flagged: testCase.unsupportedRules }, null, 2);
  setFixture('grounded');
}

function addCheck(list, passed, label, detail = '') {
  const item = element('li', `check-row ${passed ? 'pass' : 'review'}`);
  item.append(element('span', 'check-icon', passed ? '✓' : '!'));
  const copy = element('div', 'check-copy');
  copy.append(element('span', '', label));
  if (detail) copy.append(element('small', '', detail));
  item.append(copy);
  list.append(item);
}

function runChecks() {
  const reportContainer = byId('report');
  reportContainer.replaceChildren();
  try {
    currentReport = createReport(activeCase, answer.value);
  } catch (error) {
    currentReport = null;
    reportContainer.append(element('p', 'stale-message', error.message));
    byId('export-report').disabled = true;
    return;
  }
  byId('export-report').disabled = false;
  const { result } = currentReport;
  const passed = result.status === 'checks_passed';
  const summary = element('div', `report-summary ${passed ? 'passed' : 'needs-review'}`);
  const score = element('div', 'score');
  score.append(element('strong', '', String(result.score)), element('span', '', '/ 100'));
  const text = element('div', 'report-summary-copy');
  text.append(element('span', 'small-label', 'RULE SCORE'), element('h4', '', result.status === 'empty' ? 'Add an answer to evaluate' : passed ? 'All configured checks passed' : 'This answer needs a closer look'), element('p', '', passed ? 'The selected phrases and source ID matched. Review the meaning yourself before using the answer.' : 'Inspect the items below, compare with the evidence, then edit and run again.'));
  summary.append(score, text);
  const checks = element('ul', 'check-list');
  result.requiredChecks.forEach(check => addCheck(checks, check.passed, check.label, check.passed ? 'Expected phrase matched' : 'Expected phrase not detected'));
  addCheck(checks, result.citations.passed, 'Uses a recognised source identifier', result.citations.unknown.length ? `Unknown for this case: ${result.citations.unknown.join(', ')}` : result.citations.valid.length ? `Found: ${result.citations.valid.join(', ')} · Identifier only; meaning is not checked` : 'No recognised source identifier found');
  if (result.flaggedClaims.length) {
    result.flaggedClaims.forEach(claim => addCheck(checks, false, claim.label, 'An explicit unsupported-claim pattern matched'));
  } else {
    addCheck(checks, true, 'No configured unsupported-claim pattern matched', 'Other unsupported claims may still be present');
  }
  reportContainer.append(summary, checks);
}

cases.forEach((testCase, index) => {
  const button = element('button', 'case-button');
  button.type = 'button';
  button.dataset.caseId = testCase.id;
  button.append(element('span', 'case-number', `0${index + 1}`), element('span', 'case-name', testCase.shortTitle), element('span', 'case-arrow', '↗'));
  button.addEventListener('click', () => selectCase(testCase));
  byId('case-list').append(button);
});

answer.addEventListener('input', () => {
  updateCount();
  currentReport = null;
  byId('grounded-fixture').setAttribute('aria-pressed', 'false');
  byId('risky-fixture').setAttribute('aria-pressed', 'false');
  byId('export-report').disabled = true;
  byId('report').replaceChildren(element('p', 'stale-message', 'Answer changed. Run checks to generate a report for this version.'));
});
byId('grounded-fixture').addEventListener('click', () => setFixture('grounded'));
byId('risky-fixture').addEventListener('click', () => setFixture('risky'));
byId('clear-answer').addEventListener('click', () => { setFixture(null); answer.focus(); });
byId('run-checks').addEventListener('click', runChecks);
byId('export-report').addEventListener('click', () => {
  if (!currentReport) return;
  const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = element('a');
  link.href = url;
  link.download = `answer-evaluation-${activeCase.id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

selectCase(activeCase);
