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
  parts: Record<string, unknown> = {}
): string {
  let url = path;

  for (const part in parts) {
    url = url.replace(`:${part}`, parts[part] as string);
  }

  return url;
}

export function routeWithOrigin(
  path: string,
  parts: Record<string, unknown> = {}
): string {
  const origin = window.location.origin;
  const isHashRouter = import.meta.env.VITE_ROUTER === 'hash';

  const updatedOrigin = isHashRouter ? `${origin}/#` : origin;

  let url = `${updatedOrigin}${path}`;

  for (const part in parts) {
    url = url.replace(`:${part}`, parts[part] as string);
  }

  console.log(url);

  return url;
}
