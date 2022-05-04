/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Settings() {
  const [t] = useTranslation();

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('number_padding')}>
        <SelectField>
          <option value="0001">0001</option>
        </SelectField>
      </Element>

      <Element leftSide={t('generate_number')}>
        <SelectField>
          <option value="when_saved">{t('when_saved')}</option>
          <option value="when_sent">{t('when_sent')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('recurring_prefix')}>
        <InputField id="recurring_prefix" />
      </Element>

      <Element leftSide={t('shared_invoice_quote_counter')}>
        <Toggle />
      </Element>

      <Element leftSide={t('shared_invoice_credit_counter')}>
        <Toggle />
      </Element>

      <Element leftSide={t('reset_counter')}>
        <SelectField>
          <option value="never">{t('never')}</option>
        </SelectField>
      </Element>
    </Card>
  );
}
