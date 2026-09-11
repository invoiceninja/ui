# Account plan expiry browser tests

Run the standalone suite after installing project dependencies and Playwright browsers:

```sh
npx playwright install chromium firefox
npx playwright test --config playwright.account-plan.config.ts
```

No API credentials or database reset are required. The config starts its own
Vite server on port 4175 with hosted mode enabled and the force-display override
disabled. The fixture mounts the production `AccountPlanExpired` component with
minimal Redux, router and translation providers.

## Expiry contract

Timezone-less `plan_expires` values are parsed as UTC. The plan remains active
for one additional day after the parsed instant. For example, `2026-07-15`
remains active through `2026-07-16T00:00:00.000Z`; the banner appears one
millisecond later. Explicit timestamps also receive this additional day.

The tests use explicit expected timestamps rather than duplicating the
production Day.js calculation. Local parsing would shift the boundary with the
browser timezone; omitting the additional day would expire the plan too early.

See [Day.js UTC parsing](https://day.js.org/docs/en/parse/utc) and
[Playwright fixed browser clocks](https://playwright.dev/docs/clock).

## Coverage

The suite contains 144 tests across Chromium and Firefox:

- Six timezones: UTC, Los Angeles, Sydney, Kathmandu, Kiritimati and Pago Pago.
- January and July dates exercise opposite seasonal offsets in both hemispheres.
- Date-only, timezone-less SQL/ISO datetimes, explicit UTC and fractional offsets.
- Start and middle of the expiry date, then one millisecond before, at and after
  the next-day boundary: 600 date-format/boundary combinations in total.
- Missing, empty and invalid expiry, no paid plan, and non-owner suppression.
- Incorrect device clocks demonstrate that clock skew still affects the result.

All 144 tests passed against the expiry fix in commit `28ad61f79`.

## Limits

The suite renders the real banner with fixture account data; it does not test
API transport or account loading. It rerenders at each fixed time, so it does
not assert automatic refresh when an idle page crosses the expiry boundary.
Both unlock-button hooks reuse the same helper, but their UI integration is
not covered. `usePaidOrSelfhost` has separate comparisons outside this suite.
