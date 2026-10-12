/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  DurationFormat,
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';

interface FormatOption {
  value: DurationFormat;
  label: string;
}

export function DurationFormatSwitcher() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const reactSettings = useReactSettings();
  const saveReactSettings = useSaveReactSettings();

  const currentFormat = reactSettings.preferences.duration_format;

  const options: FormatOption[] = [
    { value: 'decimal', label: t('decimal') },
    { value: 'hh_mm', label: 'HH:MM' },
  ];

  const handleChange = (format: DurationFormat) => {
    if (format === currentFormat) {
      return;
    }

    saveReactSettings('preferences.duration_format', format).catch(
      () => undefined
    );
  };

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-md border"
      style={{ borderColor: colors.$5, backgroundColor: colors.$1 }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor:
              option.value === currentFormat ? colors.$2 : 'transparent',
            color: option.value === currentFormat ? colors.$3 : colors.$17,
          }}
          onClick={() => handleChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
