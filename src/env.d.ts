/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_URL: string;
  readonly VITE_IS_HOSTED: string;
  readonly VITE_ROUTER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
