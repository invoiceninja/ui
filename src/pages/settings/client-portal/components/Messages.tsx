/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Textarea } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function Messages() {
  const [t] = useTranslation();

  return (
    <Card title={t('messages')}>
      <Element leftSide={t('dashboard')}>
        <Textarea />
      </Element>

      <Element leftSide={t('unpaid_invoice')}>
        <Textarea />
      </Element>

      <Element leftSide={t('paid_invoice')}>
        <Textarea />
      </Element>

      <Element leftSide={t('unapproved_quote')}>
        <Textarea />
      </Element>
    </Card>
  );
}
