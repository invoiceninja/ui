# Playwright e2e testing guide:



## Setup
- Setup Playwright: `npx playwright install`
- Make sure system dependencies are installed: `npx playwright install-deps`
- Make sure both Laravel & React apps are up-to-date.
- Make sure Laravel application is running (it has to match with `VITE_API_URL`).
- Seed Laravel application with data needed for testing:

```sh
php artisan optimize
php artisan migrate:fresh --seed
php artisan db:seed --class=RandomDataSeeder
```

## Running

Playwright uses the production Vite build from `.env.testing`.

Serial run:

```bash
npm run test:e2e
```

Equivalent direct command:

```bash
npx playwright test --workers=1
```

> Keep `--workers=1` for direct Playwright runs. The tests share seeded backend state, permission users, and company settings, so in-process workers can race each other.

For local development, run Chromium only:

```bash
npx playwright test --project=chromium --workers=1
```

For headed debugging:

```bash
npx playwright test --project=chromium --workers=1 --headed
```

### Isolated Parallel Run

The isolated parallel runner executes multiple spec files at the same time while keeping each spec process on one Playwright worker:

```bash
npm run test:e2e:parallel
```

Useful variants:

```bash
npm run test:e2e:parallel -- --concurrency=4
npm run test:e2e:parallel -- tests/e2e/clients.spec.ts
npm run test:e2e:parallel -- --project=firefox --concurrency=2
npm run test:e2e:parallel -- tests/e2e/clients.spec.ts -- --headed
npm run test:e2e:parallel -- --verbose
npm run test:e2e:parallel -- --fail-fast
```

By default the runner only prints Playwright pass/fail lines and the final spec summary. Setup, preview, and account-reset logs stay hidden unless you pass `--verbose` (`-v`) or set `E2E_VERBOSE=1`. The same env var also unlocks those helper logs during a serial `npm run test:e2e` run.

`--fail-fast` (or `--max-failures=1`, or `E2E_FAIL_FAST=1`) stops the whole parallel run after the first failed test: the failing spec exits immediately, other in-flight specs are cancelled, and queued specs are skipped.

The runner builds with `vite build --mode testing --outDir dist-testing`, starts or reuses Vite preview on port `4173`, and prefixes output per isolated spec lane. Set `PLAYWRIGHT_VITE_OUT_DIR` to override the test build directory. Because `package.json` now exposes this runner, `scripts/playwright-spec-orchestrator.mjs` should be committed with the test changes.

## Test Idempotency

Tests are designed to be **idempotent** — they can run against any API state and
produce consistent results regardless of prior test runs or failures.

### How it works

1. **Global setup** (`tests/e2e/global-setup.ts`) runs before the suite and
   calls `resetTestAccount` for each account lane: purges entities, restores
   deleted seed users, clears permission users via API (`permissions: ''`), and
   resets company settings.

2. **Per-spec reset** — every spec calls `resetAccountBeforeAll()` from
   `tests/e2e/fixtures.ts`. That registers a `beforeAll` which runs the same
   `resetTestAccount` again for the worker’s lane before the file’s tests.
   This is intentional isolation (and duplicates global setup); keep it until a
   later remediation removes one of the layers.

3. **Per-test cleanup** via fixtures (`tests/e2e/fixtures.ts`). Tests use the
   `api` fixture to track entities they create; tracked entities are
   automatically deleted (archive + delete) on teardown, even if the test fails.

4. **Unique names** — every entity created by a test uses `uniqueName('prefix')`
   to generate a timestamped name, avoiding collisions across runs.

5. **Settings guard** — tests that modify company settings call
   `settingsGuard.snapshot()` before changes. Settings are restored on teardown.

### Permission users

After account reset, the seeded permission users (e.g. `clients@example.com`,
`permissions@example.com`) start with empty permissions. For a “no permission”
assertion you can log in as that user directly. If a prior test in the same file
assigned permissions, reset them with `api.setPermissions(email, [])` first.

Tests assign permissions through `api.setPermissions(email, permissions)`.
The helper replaces the complete permission state and maps `admin` to the
company-user administrator flag. Do not leave permissions dirty for later tests
in the same file: call `api.setPermissions` again when the next test needs a
different permission state (there is no permission teardown).

### Writing idempotent tests

```typescript
import { test, expect, uniqueName } from '$tests/e2e/fixtures';

test('my test', async ({ page, api }) => {
  const clientName = uniqueName('my-client');

  // Create entity via UI...
  // Track it for cleanup:
  const id = page.url().match(/clients\/([^/]+)/)?.[1];
  if (id) api.trackEntity('clients', id);

  // Or create via API (faster):
  const product = await api.createEntity('products', {
    product_key: uniqueName('my-product'),
  });
  // ^ automatically tracked for cleanup
});
```
