/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/cards';
import { Settings } from '../../../components/layouts/Settings';

export function GeneratedNumbers() {
  const [t] = useTranslation();

  return (
    <Settings title={t('generated_numbers')}>
      <Card title={t('settings')}>{/*  */}</Card>
    </Settings>
  );
}
