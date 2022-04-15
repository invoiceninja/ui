/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { Gateway, Option } from 'common/interfaces/statics';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleMethodToggle } from '../hooks/useHandleMethodToggle';
import { useResolveGatewayTypeTranslation } from '../hooks/useResolveGatewayTypeTranslation';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
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

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('label')}>
        <InputField
          value={props.companyGateway.label || gateway.name}
          onValueChange={(value) => handleChange('label', value)}
        />
      </Element>

      {options.some((option) => option.token_billing == true) && (
        <Element leftSide={t('capture_card')}>
          <SelectField
            value={props.companyGateway.token_billing || 'off'}
            onValueChange={(value) => handleChange('token_billing', value)}
          >
            <option value="always">{t('enabled')}</option>
            <option value="optout">{t('enabled_by_default')}</option>
            <option value="optin">{t('disabled_by_default')}</option>
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
            onChange={(value) =>
              handlePaymentMethod(option.gatewayTypeId, value)
            }
          />
        </Element>
      ))}
    </Card>
  );
}
