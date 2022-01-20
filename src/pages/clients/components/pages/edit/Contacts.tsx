/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';

export function Contacts() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('contacts')}>
      {/*  */}
    </Card>
  );
}
