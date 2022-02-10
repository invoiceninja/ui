/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';

export function Totals() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max">
      <Element pushContentToRight leftSide={t('subtotal')}>
        $0
      </Element>

      <Element pushContentToRight leftSide={t('balance_due')}>
        $0
      </Element>
    </Card>
  );
}
