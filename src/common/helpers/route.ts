/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function route(
  path: string,
  parts: Record<string, unknown> = {},
): string {
  let url = path;

  for (const part in parts) {
    url = url.replace(`:${part}`, parts[part] as string);
  }

  return url;
}
