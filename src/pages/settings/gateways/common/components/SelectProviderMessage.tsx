/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';

export function SelectProviderMessage() {
  const [t] = useTranslation();

  return (
    <Card className="flex justify-center">
      <span className="text-gray-900">{t('select_provider')}</span>
    </Card>
  );
}
