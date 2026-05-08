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
- Build React app (Playwright uses production build):

```bash
npm run build
```

Running tests:

```
npx playwright test --workers=1
```

> Don't forget `--workers=1` to prevent race conditions and tests possibly randomly failing.

This will run tests using Chromium & Firefox.

For local development testing, you'll most likely want to test only in Chrome:

```
npx playwright test --project=chromium --workers=1
```

To run tests in headed mode:

```
npx playwright test --project=chromium --workers=1 --headed
```

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
