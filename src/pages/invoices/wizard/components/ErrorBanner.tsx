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

const TOASTED_ERROR_KEYS = ['amount'];

interface Props {
  errors?: ValidationBag;
  handled?: string[];
}

export function ErrorBanner({ errors, handled }: Props) {
  if (!errors?.errors) {
    return null;
  }

  const covered = [...TOASTED_ERROR_KEYS, ...(handled ?? [])];

  const unmapped = Object.entries(errors.errors)
    .filter(([key]) => !covered.some((known) => key.startsWith(known)))
    .flatMap(([, messages]) => messages);

  if (!unmapped.length) {
    return null;
  }

  return (
    <div className="border-l-4 border-red-500 bg-red-50 py-2 mb-4">
      <div className="mx-4 space-y-1">
        {unmapped.map((message) => (
          <p key={message} className="text-sm text-red-700">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
