/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickableElement, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Divider } from '$app/components/cards/Divider';
import { LinkToVariables } from '../common/components/LinkToVariables';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';

export function Quotes() {
  const [t] = useTranslation();
  const [pattern, setPattern] = useState<string>('');

  const colors = useColorScheme();
  const companyChanges = useCompanyChanges();

  const disableSettingsField = useDisableSettingsField();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const handleChange = useHandleCurrentCompanyChangeProperty();

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
    <>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="quote_number_pattern"
            labelElement={<SettingsLabel label={t('number_pattern')} />}
          />
        }
      >
        <InputField
          value={companyChanges?.settings?.quote_number_pattern || ''}
          onValueChange={(value) =>
            handleChange('settings.quote_number_pattern', value)
          }
          disabled={disableSettingsField('quote_number_pattern')}
          errorMessage={errors?.errors['settings.quote_number_pattern']}
        />
      </Element>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="quote_number_counter"
            labelElement={<SettingsLabel label={t('number_counter')} />}
          />
        }
      >
        <NumberInputField
          precision={0}
          value={companyChanges?.settings?.quote_number_counter || ''}
          onValueChange={(value) =>
            handleChange(
              'settings.quote_number_counter',
              parseFloat(value) || 0
            )
          }
          disabled={disableSettingsField('quote_number_counter')}
          errorMessage={errors?.errors['settings.quote_number_counter']}
        />
      </Element>

      <div className="px-4 sm:px-6 py-4">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      {variables.map((item, index) => (
        <ClickableElement
          onClick={() => setPattern(pattern + item)}
          key={index}
        >
          <CopyToClipboard text={item} />
        </ClickableElement>
      ))}

      <div className="px-4 sm:px-6 pt-4 pb-6">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      <LinkToVariables />
    </>
  );
}
