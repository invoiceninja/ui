import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const en = JSON.parse(
  fs.readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../src/resources/lang/en/en.json'
    ),
    'utf8'
  )
) as Record<string, string>;

/** English copy from bundled en.json — keep in sync with what the app shows in e2e. */
export function t(key: string): string {
  const value = en[key];

  if (!value) {
    throw new Error(`Missing translation for ${key}`);
  }

  return value;
}
