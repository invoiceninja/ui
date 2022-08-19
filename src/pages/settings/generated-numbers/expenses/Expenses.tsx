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
import { Settings } from '../../../../components/layouts/Settings';
import { updateChanges } from 'common/stores/slices/company-users';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useDispatch } from 'react-redux';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { ChangeEvent } from 'react';
import { useHandleCompanySave } from 'pages/settings/common/hooks/useHandleCompanySave';
import { useDiscardChanges } from 'pages/settings/common/hooks/useDiscardChanges';

export function Expenses() {
  const [t] = useTranslation();
  const [pattern, setPattern] = useState<string>('');
  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('generated_numbers'), href: '/settings/generated_numbers' },
    { name: t('expenses'), href: '/settings/generated_numbers/expenses' },
  ];

  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();
  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();
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
    <Settings
      title={t('generated_numbers')}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      docsLink="docs/advanced-settings/#clients-invoices-recurring-invoices-payments-etc"
    >
      <Card title={`${t('generated_numbers')}: ${t('expenses')}`}>
        <Element leftSide={t('number_pattern')}>
          <InputField
            id="settings.expense_number_pattern"
            value={companyChanges?.settings?.expense_number_pattern}
            onChange={handleChange}
          />
        </Element>
        <Element leftSide={t('number_counter')}>
          <InputField
            id="settings.expense_number_counter"
            value={companyChanges?.settings?.expense_number_counter}
            onChange={handleChange}
          />
        </Element>
      </Card>

      <Card>
        {variables.map((item, index) => (
          <ClickableElement
            onClick={() => setPattern(pattern + item)}
            key={index}
          >
            {item}
          </ClickableElement>
        ))}
      </Card>
    </Settings>
  );
}
