/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Check } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';

export function GoCardlessOAuth2() {
  const { t } = useTranslation();

  return (
    <Element leftSide={t('OAuth 2.0')}>
      <Check size={18} />
    </Element>
  );
}
