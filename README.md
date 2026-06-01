# TradeMe Search Automation

Playwright test framework for checking TradeMe sandbox search behaviour and the public Categories API.

The project is intentionally small: UI tests live under `tests/UI`, API tests under `tests/API`, with shared page objects and helpers kept in `pages` and `utils`.

## What is covered

- Search input visibility, focus, typing, and submit behaviour
- Search results, no-result handling, pagination, and basic navigation
- A small set of responsive, accessibility, performance, and input-safety checks
- TradeMe Categories API response status, headers, structure, data consistency, and basic negative cases
- Allure, Playwright HTML, and JSON reporting

## Project structure

```text
.
|-- config/
|   `-- test.config.ts
|-- pages/
|   `-- SearchPage.ts
|-- tests/
|   |-- API/
|   |   `-- categories.spec.ts
|   `-- UI/
|       `-- search.spec.ts
|-- utils/
|   |-- apiHelper.ts
|   `-- helpers.ts
|-- playwright.config.ts
|-- package.json
`-- tsconfig.json
```

Generated output such as `test-results`, `playwright-report`, and `allure-results` can be deleted and recreated by running the tests again.

## Prerequisites

- Node.js 16 or newer
- npm
- Playwright browsers installed locally

## Setup

```bash
npm install
npx playwright install
```

Optional local config:

```bash
copy .env.example .env
```

The default UI base URL is `https://www.tmsandbox.co.nz/`. 
The API helper calls `https://api.trademe.co.nz`.

## Running tests

```bash
npm test
```

Run one suite:

```bash
npm run test:ui
npm run test:api
```

Open reports:

```bash
npm run test:report
npm run allure:report
npm run allure:open
```

Debug locally:

```bash
npm run test:headed
npm run test:debug
npx playwright test -g "TC-F-10"
```

## Test counts

The current suite has 68 tests:

- 35 UI tests for search
- 33 API tests for Categories

On the latest local run, the API suite passed. Some UI suggestion tests may skip because autocomplete is not always available in the TradeMe sandbox. Treat the README numbers as a guide and use the generated report as the source of truth after each run.

## Notes on known behaviour

- Autocomplete-related UI tests are written defensively. If no suggestions appear, the relevant tests skip instead of failing the whole suite.
- One keyboard suggestion test can time out when the sandbox does not expose selectable suggestions.
- Live-site timing assertions use relaxed thresholds because the sandbox and network conditions can vary.

## Configuration

Main settings are in `config/test.config.ts`:

- URLs and endpoint defaults
- Wait times and performance thresholds
- Viewport sizes
- Shared search terms and edge-case inputs

Playwright settings are in `playwright.config.ts`:

- Test directory: `tests`
- Browser project: Chromium
- Reports: Allure, HTML, and JSON
- Screenshots/video kept on failure
- Trace captured on first retry

## Useful scripts

```bash
npm test                  # run all tests
npm run test:ui           # run UI tests
npm run test:api          # run API tests
npm run test:headed       # run with browser visible
npm run test:debug        # launch Playwright debug mode
npm run test:report       # open Playwright HTML report
npm run allure:report     # generate Allure report
npm run allure:open       # open Allure report
npm run clean             # remove generated test output
```

## Adding a UI test

```typescript
test('[TC-F-XX] Search returns results for a new term', async () => {
  await searchPage.focusSearchBox();
  await searchPage.typeInSearchBox('camera');
  await searchPage.searchByEnter();

  const resultsCount = await searchPage.getResultsCount();
  expect(resultsCount).toBeGreaterThanOrEqual(0);
});
```

## Adding an API test

```typescript
test('[API-CAT-XX] Categories response is successful', async () => {
  const response = await apiHelper.get('/v1/Categories.json');

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('Subcategories');
});
```

## Maintenance tips

- Keep selectors in `pages/SearchPage.ts` unless a test genuinely needs a one-off locator.
- Keep API request handling in `utils/apiHelper.ts`.
- Prefer small assertions that match observable behaviour in the sandbox.
- Re-run affected tests after changing selectors, waits, or helper methods.

## References

- [Playwright documentation](https://playwright.dev)
- [Allure documentation](https://docs.qameta.io/allure/)
- [TradeMe API documentation](https://developer.trademe.co.nz/api-reference/)
