/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';

export const firstErrorMessage = (
  bag: ValidationBag | undefined,
  handled: string[] = []
): string | undefined => {
  const entry = Object.entries(bag?.errors ?? {}).find(([key, messages]) => {
    return !handled.includes(key) && Boolean(messages?.length);
  });

  const messages = entry?.[1] as string[] | string | undefined;

  return Array.isArray(messages) ? messages[0] : messages;
};
