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
  label: string;
  help?: string;
}

export function FieldHeading({ label, help }: Props) {
  const colors = useColorScheme();

  return (
    <div className="mb-2.5">
      <p className="text-sm" style={{ color: colors.$22, fontWeight: 500 }}>
        {label}
      </p>

      {help ? (
        <p className="text-[0.8125rem] mt-0.5" style={{ color: colors.$22 }}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
