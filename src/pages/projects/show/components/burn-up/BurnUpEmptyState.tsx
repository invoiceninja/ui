/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';

interface Props {
  message: string;
}

export function BurnUpEmptyState({ message }: Props) {
  const colors = useColorScheme();

  return (
    <div
      className="mt-6 flex items-center justify-center rounded-md border border-dashed py-12 text-sm"
      style={{ borderColor: colors.$24, color: colors.$17 }}
    >
      {message}
    </div>
  );
}
