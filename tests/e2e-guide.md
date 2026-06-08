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
```

The runner builds with `vite build --mode testing --outDir dist-testing`, starts or reuses Vite preview on port `4173`, and prefixes output per isolated spec lane. Set `PLAYWRIGHT_VITE_OUT_DIR` to override the test build directory. Because `package.json` now exposes this runner, `scripts/playwright-spec-orchestrator.mjs` should be committed with the test changes.

## Test Idempotency

Tests are designed to be **idempotent** — they can run against any API state and
produce consistent results regardless of prior test runs or failures.

### How it works

1. **Global setup** (`tests/e2e/global-setup.ts`) runs before the suite and
   resets the API to a clean state: purges entities, restores deleted seed users,
   resets permissions, and resets company settings.

2. **Per-test cleanup** via fixtures (`tests/e2e/fixtures.ts`). Tests use the
   `api` fixture to track entities they create; tracked entities are
   automatically deleted (archive + delete) on teardown, even if the test fails.

3. **Unique names** — every entity created by a test uses `uniqueName('prefix')`
   to generate a timestamped name, avoiding collisions across runs.

4. **Settings guard** — tests that modify company settings call
   `settingsGuard.snapshot()` before changes. Settings are restored on teardown.

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
