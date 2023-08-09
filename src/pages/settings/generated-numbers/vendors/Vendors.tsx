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
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useDispatch } from 'react-redux';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { ChangeEvent } from 'react';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Divider } from '$app/components/cards/Divider';
import { LinkToVariables } from '../common/components/LinkToVariables';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';

export function Vendors() {
  const [t] = useTranslation();
  const [pattern, setPattern] = useState<string>('');

  const companyChanges = useCompanyChanges();

  const dispatch = useDispatch();

  const errors = useAtomValue(companySettingsErrorsAtom);

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
    <Card title={t('vendors')}>
      <Element leftSide={t('number_pattern')}>
        <InputField
          id="settings.vendor_number_pattern"
          value={companyChanges?.settings?.vendor_number_pattern}
          onChange={handleChange}
          errorMessage={errors?.errors['settings.vendor_number_pattern']}
        />
      </Element>
      <Element leftSide={t('number_counter')}>
        <InputField
          id="settings.vendor_number_counter"
          value={companyChanges?.settings?.vendor_number_counter}
          onChange={handleChange}
          errorMessage={errors?.errors['settings.vendor_number_counter']}
        />
      </Element>

      <Divider />

      {variables.map((item, index) => (
        <ClickableElement
          onClick={() => setPattern(pattern + item)}
          key={index}
        >
          <CopyToClipboard text={item} />
        </ClickableElement>
      ))}

      <Divider />

      <LinkToVariables />
    </Card>
  );
}
