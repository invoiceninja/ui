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
import { InputField, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Invoices() {
  const [t] = useTranslation();

  return (
    <Card title={t('invoices')}>
      <Element
        leftSide={t('auto_email_invoice')}
        leftSideHelp={t('auto_email_invoice_help')}
      >
        <Toggle />
      </Element>
      <Element
        leftSide={t('auto_archive_invoice')}
        leftSideHelp={t('auto_archive_invoice_help')}
      >
        <Toggle />
      </Element>

      <div className="pt-6 border-b"></div>

      <Element className="mt-4" leftSide={t('lock_invoices')}>
        <SelectField>
          <option value="off">{t('off')}</option>
          <option value="when_sent">{t('when_sent')}</option>
          <option value="when_paid">{t('when_paid')}</option>
        </SelectField>
      </Element>
    </Card>
  );
}
