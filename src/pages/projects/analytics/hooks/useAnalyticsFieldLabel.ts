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
import { FIELD_LABELS } from '../constants';

export function useAnalyticsFieldLabel() {
  const [t] = useTranslation();

  return (key: string) => {
    const translationKey = FIELD_LABELS[key];

    if (!translationKey) {
      return key.replace(/_/g, ' ');
    }

    return t(translationKey);
  };
}
