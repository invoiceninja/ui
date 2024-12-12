/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { usePreferences } from './usePreferences';

export function useSystemFonts() {
  const { preferences } = usePreferences();

  useEffect(() => {
    if (preferences.use_system_fonts) {
      changeFont('system-ui');

      return;
    }

    changeFont('Inter var');
  }, [preferences.use_system_fonts]);

  return null;
}

export function changeFont(font: string) {
  const current = window
    .getComputedStyle(document.body)
    .fontFamily.split(',')
    .map((font) => font.trim());

  const updated = [font, ...current].join(', ');

  document.body.style.fontFamily = updated;
}
