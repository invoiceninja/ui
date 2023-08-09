/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway, Option } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleMethodToggle } from '../hooks/useHandleMethodToggle';
import { useResolveGatewayTypeTranslation } from '../hooks/useResolveGatewayTypeTranslation';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
  errors: ValidationBag | undefined;
}

interface OptionWithGatewayTypeId extends Option {
  gatewayTypeId: string;
}

export function Settings(props: Props) {
  const [t] = useTranslation();
  const [gateway, setGateway] = useState<Gateway>(props.gateway);
  const [options, setOptions] = useState<OptionWithGatewayTypeId[]>([]);

  useEffect(() => setGateway(props.gateway), [props.gateway]);

  useEffect(() => {
    const options = [];

    for (const option in gateway.options) {
      options.push({ gatewayTypeId: option, ...gateway.options[option] });
    }

    setOptions([...options]);
  }, [gateway]);

  const resolveGatewayTypeTranslation = useResolveGatewayTypeTranslation();

  const handleChange = (
    property: keyof CompanyGateway,
    value: string | number | boolean
  ) => {
    props.setCompanyGateway(
      (gateway) => gateway && { ...gateway, [property]: value }
    );
  };

  const handlePaymentMethod = useHandleMethodToggle(
    props.companyGateway,
    props.setCompanyGateway
  );

  const isChecked = (gatewayTypeId: string) => {
    const property = Object.entries(props.companyGateway.fees_and_limits).find(
      ([companyGatewayId]) => gatewayTypeId === companyGatewayId
    );

    if (!property) {
      return false;
    }

    const [, entry] = property;

    return entry.is_enabled;
  };

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('label')}>
        <InputField
          value={props.companyGateway.label || gateway.name}
          onValueChange={(value) => handleChange('label', value)}
          errorMessage={props.errors?.errors.label}
        />
      </Element>

      {options.some((option) => option.token_billing == true) && (
        <Element leftSide={t('capture_card')}>
          <SelectField
            value={props.companyGateway.token_billing || 'off'}
            onValueChange={(value) => handleChange('token_billing', value)}
            errorMessage={props.errors?.errors.token_billing}
          >
            <option value="always">{t('enabled')}</option>
            <option value="optout">{t('auto_bill_help_optout')}</option>
            <option value="optin">{t('auto_bill_help_optin')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>
      )}

      <Divider />

      {options.map((option, index) => (
        <Element
          key={index}
          leftSide={resolveGatewayTypeTranslation(option.gatewayTypeId)}
        >
          <Toggle
            checked={isChecked(option.gatewayTypeId)}
            onChange={(value) =>
              handlePaymentMethod(option.gatewayTypeId, value)
            }
          />
        </Element>
      ))}
    </Card>
  );
}
