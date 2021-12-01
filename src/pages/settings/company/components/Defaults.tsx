/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { SelectField } from '../../../../components/forms';

export function Defaults() {
  const [t] = useTranslation();

  return (
    <Card title={t('defaults')}>
      <Element leftSide={t('auto_bill')}>
        <SelectField>
          <option defaultChecked></option>
          <option value="enabled">{t('enabled')}</option>
          <option value="enabled_by_default">Enabled by default</option>
          <option value="disabled_by_default">Disabled by default</option>
          <option value="disabled">Disabled</option>
        </SelectField>
      </Element>
      <Element leftSide={t('payment_type')}>
        <SelectField>
          <option value="disabled">PayPal</option>
        </SelectField>
      </Element>
      <Element leftSide={t('payment_terms')}>
        <SelectField>
          <option value=""></option>
          <option value="-1">Net 0</option>
          <option value="7">Net 7</option>
          <option value="10">Net 10</option>
          <option value="14">Net 14</option>
          <option value="15">Net 15</option>
          <option value="30">Net 30</option>
          <option value="60">Net 60</option>
          <option value="90">Net 90</option>
        </SelectField>
      </Element>
      <Element leftSide={t('quote_valid_until')}>
        <SelectField>
          <option value=""></option>
          <option value="-1">Net 0</option>
          <option value="7">Net 7</option>
          <option value="10">Net 10</option>
          <option value="14">Net 14</option>
          <option value="15">Net 15</option>
          <option value="30">Net 30</option>
          <option value="60">Net 60</option>
          <option value="90">Net 90</option>
        </SelectField>
      </Element>
      <Element leftSide={t('invoice_valid_until')}>
        <SelectField>
          <option value=""></option>
          <option value="-1">Net 0</option>
          <option value="7">Net 7</option>
          <option value="10">Net 10</option>
          <option value="14">Net 14</option>
          <option value="15">Net 15</option>
          <option value="30">Net 30</option>
          <option value="60">Net 60</option>
          <option value="90">Net 90</option>
        </SelectField>
      </Element>
    </Card>
  );
}
