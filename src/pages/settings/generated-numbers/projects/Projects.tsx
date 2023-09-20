/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ClickableElement, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Divider } from '$app/components/cards/Divider';
import { LinkToVariables } from '../common/components/LinkToVariables';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useDispatch } from 'react-redux';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { updateChanges } from '$app/common/stores/slices/company-users';

export function Projects() {
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
    '{$date:Y-m-d}',
    '{$user_id}',
    '{$user_custom1}',
    '{$user_custom2}',
    '{$user_custom3}',
    '{$user_custom4}',
  ];

  return (
    <Card title={t('projects')}>
      <Element leftSide={t('number_pattern')}>
        <InputField
          id="settings.project_number_pattern"
          value={companyChanges?.settings?.project_number_pattern || ''}
          onChange={handleChange}
          errorMessage={errors?.errors['settings.project_number_pattern']}
        />
      </Element>
      <Element leftSide={t('number_counter')}>
        <InputField
          id="settings.project_number_counter"
          value={companyChanges?.settings?.project_number_counter || 1}
          onChange={handleChange}
          errorMessage={errors?.errors['settings.project_number_counter']}
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
