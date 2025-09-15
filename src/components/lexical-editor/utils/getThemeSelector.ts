/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EditorThemeClasses } from 'lexical';

export function getThemeSelector(
  getTheme: () => EditorThemeClasses | null | undefined,
  name: keyof EditorThemeClasses
): string {
  const className = getTheme()?.[name];
  if (typeof className !== 'string') {
    throw new Error(
      `getThemeClass: required theme property ${name} not defined`
    );
  }
  return className
    .split(/\s+/g)
    .map((cls) => `.${cls}`)
    .join();
}
