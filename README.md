# Invoice Ninja Web

The React admin portal for [Invoice Ninja](https://github.com/invoiceninja/invoiceninja) — invoices, quotes, clients, payments, expenses, projects, tasks, and reports.

## Requirements

- Node.js 22 or newer
- npm
- A running Invoice Ninja API instance

## Getting started

```sh
git clone https://github.com/invoiceninja/web.git
cd web
cp .env.example .env
npm install
npm run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

Set `VITE_API_URL` in `.env` to your Invoice Ninja backend (for example `http://ninja.test`). Leave the Sentry values empty for self-hosted builds.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Build and serve the production bundle |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |
| `npm run check` | Lint and format, applying safe fixes |

End-to-end tests build the app in `testing` mode and serve it on port `4173`. They need a seeded backend and read configuration from `.env.testing` first, then `.env`; see `playwright.config.ts` for details.

## Contributing

Contributions are welcome. Please open an issue or pull request in this repository.

- [Code of conduct](https://github.com/invoiceninja/invoiceninja/blob/v5-stable/CODE_OF_CONDUCT.md)
- [Developer guide](https://invoiceninja.github.io/en/developer-guide/)

## License

[Elastic License 2.0 (ELv2)](https://github.com/invoiceninja/invoiceninja/blob/v5-stable/LICENSE)
