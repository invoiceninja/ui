/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_URL: string;
  readonly VITE_IS_HOSTED: string;
  readonly VITE_ROUTER: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_MICROSOFT_CLIENT_ID: string;
  readonly VITE_DEMO_ENDPOINT: string;
  readonly VITE_DEMO_EMAIL: string;
  readonly VITE_DEMO_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
