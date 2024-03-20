/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

type ThemeKey = 'light' | 'dark' | 'cerulean';

interface Theme {
  palette: string[];
}
const COLOR_THEMES: Record<ThemeKey, Theme> = {
  light: {
    palette: [''],
  },
  dark: {
    palette: [''],
  },
  cerulean: {
    palette: [''],
  },
};

export function StatusColorTheme() {
  const [t] = useTranslation();

  return (
    <Element leftSide={t('status_color_theme')}>
      <SelectField>
        {Object.keys(COLOR_THEMES).map((themeKey, index) => (
          <option key={index} value={themeKey}>
            {t(themeKey)}
          </option>
        ))}
      </SelectField>
    </Element>
  );
}
