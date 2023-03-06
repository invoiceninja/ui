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
