/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { updateChanges } from 'common/stores/slices/company-users';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useDispatch } from 'react-redux';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { ChangeEvent } from 'react';
import { CopyToClipboard } from 'components/CopyToClipboard';

export function RecurringInvoices() {
  const [t] = useTranslation();

  const [pattern, setPattern] = useState<string>('');

  const companyChanges = useCompanyChanges();

  const dispatch = useDispatch();

  useInjectCompanyChanges();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  const variables = [
    '{$counter}',
    '{$year}',
    '{$date:format}',
    '{$user_id}',
    '{$user_custom1}',
    '{$user_custom2}',
    '{$user_custom3}',
    '{$user_custom4}',
  ];

  return (
    <Card title={t('recurring_invoices')}>
      <Element leftSide={t('number_pattern')}>
        <InputField
          id="settings.recurring_invoice_number_pattern"
          value={companyChanges?.settings?.recurring_invoice_number_pattern}
          onChange={handleChange}
        />
      </Element>
      <Element leftSide={t('number_counter')}>
        <InputField
          id="settings.recurring_invoice_number_counter"
          value={companyChanges?.settings?.recurring_invoice_number_counter}
          onChange={handleChange}
        />
      </Element>

      <Card>
        {variables.map((item, index) => (
          <ClickableElement
            onClick={() => setPattern(pattern + item)}
            key={index}
          >
            <CopyToClipboard text={item} />
          </ClickableElement>
        ))}
      </Card>
    </Card>
  );
}
