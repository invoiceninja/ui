/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';

export function TemplatesAndReminders() {
  const [t] = useTranslation();

  return (
      <Settings title={t('templates_and_reminders')}>
          <Card title={t('edit')}>
              {/*  */}
          </Card>
      </Settings>
  )
}
