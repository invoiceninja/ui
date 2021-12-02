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
import { Card, Element } from '../../../../components/cards';
import { Checkbox } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Notifications() {
  const [t] = useTranslation();

  const options: { label: string; field: string }[] = [
    { label: t('invoice_created'), field: 'invoice_created' },
    { label: t('invoice_sent'), field: 'invoice_sent' },
    { label: t('invoice_viewed'), field: 'invoice_viewed' },
    { label: t('invoice_late'), field: 'invoice_late' },
    { label: t('payment_success'), field: 'payment_success' },
    { label: t('payment_failure'), field: 'payment_failure' },
    { label: t('quote_created'), field: 'quote_created' },
    { label: t('quote_sent'), field: 'quote_sent' },
    { label: t('quote_viewed'), field: 'quote_viewed' },
    { label: t('quote_approved'), field: 'quote_approved' },
    { label: t('quote_expired'), field: 'quote_expired' },
    { label: t('credit_created'), field: 'credit_created' },
    { label: t('credit_sent'), field: 'credit_sent' },
    { label: t('credit_viewed'), field: 'credit_viewed' },
  ];

  return (
    <Card title={t('notifications')}>
      <Element leftSide={t('all_events')}>
        <Checkbox />
      </Element>

      <div className="pt-6 border-b"></div>

      {options.map((notification) => {
        return (
          <Element className="mt-4" leftSide={notification.label}>
            <Toggle />
          </Element>
        );
      })}
    </Card>
  );
}
