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
    { label: t('invoice_created'), field: 'invoice_created_all' },
    { label: t('invoice_sent'), field: 'invoice_sent_all' },
    { label: t('invoice_viewed'), field: 'invoice_viewed_all' },
    { label: t('invoice_late'), field: 'invoice_late_all' },

    { label: t('payment_success'), field: 'payment_success_all' },
    { label: t('payment_failure'), field: 'payment_failure_all' },

    { label: t('quote_created'), field: 'quote_created_all' },
    { label: t('quote_sent'), field: 'quote_sent_all' },
    { label: t('quote_viewed'), field: 'quote_viewed_all' },
    { label: t('quote_approved'), field: 'quote_approved_all' },
    { label: t('quote_expired'), field: 'quote_expired_all' },

    { label: t('credit_created'), field: 'credit_created_all' },
    { label: t('credit_sent'), field: 'credit_sent_all' },
    { label: t('credit_viewed'), field: 'credit_viewed_all' },
  ];

  return (
    <Card title={t('notifications')}>
      <Element leftSide={t('all_events')}>
        <Checkbox />
      </Element>

      <div className="pt-6 border-b"></div>

      {options.map((notification, index) => (
        <Element key={index} className="mt-4" leftSide={notification.label}>
          <Toggle />
        </Element>
      ))}
    </Card>
  );
}
