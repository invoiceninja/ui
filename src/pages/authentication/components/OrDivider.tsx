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

export function OrDivider() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ backgroundColor: colors.$5 }} />

      <span
        className="text-xs uppercase tracking-wide"
        style={{ color: colors.$17 }}
      >
        {t('or')}
      </span>

      <div className="h-px flex-1" style={{ backgroundColor: colors.$5 }} />
    </div>
  );
}
