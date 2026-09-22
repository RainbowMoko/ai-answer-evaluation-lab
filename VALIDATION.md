# Validation

Checked on 21 September 2026 with Node.js v24.19.0 on Windows.

- `npm.cmd test`: **21 tests passed, 0 failed**.
- `node --check` succeeded for `app.js`, `data.mjs`, `evaluator.mjs`, `server.mjs`, and `test/evaluator.test.mjs`.
- Grounded fixture scores: delivery **100**, warranty **100**, missing specifications **100**.
- Risky fixture scores: delivery **0**, warranty **13**, missing specifications **0**.
- No dependencies installed, external model called, API key used, or repository published during this validation.

## Browser verification

Verified in Brave on 21 September 2026 against the local server at `http://127.0.0.1:4173`:

- Desktop layout renders without clipping at a 1920-pixel viewport.
- All three cases can be selected; grounded fixtures display 100, and risky fixtures display 0, 13 and 0 respectively, with their expected checks and claim flags.
- Editing an answer replaces the old report with a stale-result message and disables export. Running checks creates a fresh report and enables export.
- A manually entered abstention answer passes the expected checks.
- Clear produces an empty answer with score 0.
- The exact-rule disclosure opens and exposes readable rule definitions.
- The 390 × 844 viewport shows a readable stacked layout. Measured document width was 375 pixels (the remaining width was the vertical scrollbar), with no horizontal overflow. Temporary viewport overrides were cleared afterwards.
- Saved screenshots: `screenshots/desktop.png` and `screenshots/mobile.png`.
- No app-origin errors were observed in captured browser logs. Unrelated browser-extension warnings were present.

### Export verification limit

Clicking Export JSON was exercised, but the browser automation download event timed out and a matching file was not found in the standard Downloads directory. The browser's internal downloads page was blocked by the automation URL policy; that restriction was respected. **The end-to-end browser download is not verified.** JSON report construction and serialisation passed the unit tests.

The local server was left running for review. Unit and browser checks do not establish accessibility conformance or comprehensive factual correctness; no such claim is made.
