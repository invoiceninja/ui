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
  helpLabel?: string | null;
  required?: boolean;
}

export function SettingsLabel(props: Props) {
  const { label, helpLabel, required } = props;

  const colors = useColorScheme();

  return (
    <div className="flex flex-col text-sm">
      <span className="font-medium" style={{ color: colors.$3 }}>
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {helpLabel && (
        <span
          className="text-xs"
          dangerouslySetInnerHTML={{ __html: helpLabel }}
          style={{ color: colors.$3, opacity: 0.8 }}
        ></span>
      )}
    </div>
  );
}
