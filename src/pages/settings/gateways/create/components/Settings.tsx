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
import { GatewayType } from 'common/enums/gateway-type';
import { Gateway, Option } from 'common/interfaces/statics';
import Toggle from 'components/forms/Toggle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolveGatewayTypeTranslation } from '../hooks/useResolveGatewayTypeTranslation';

interface Props {
  gateway: Gateway;
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

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('label')}>
        <InputField value={gateway.name} />
      </Element>

      {options.some((option) => option.token_billing == true) && (
        <Element leftSide={t('capture_card')}>
          <SelectField>
            <option value="">{t('enabled')}</option>
            <option value="">{t('enabled_by_default')}</option>
            <option value="">{t('disabled_by_default')}</option>
            <option value="">{t('off')}</option>
          </SelectField>
        </Element>
      )}

      {options.map((option, index) => (
        <Element
          key={index}
          leftSide={resolveGatewayTypeTranslation(option.gatewayTypeId)}
        >
          <Toggle checked={option.gatewayTypeId === GatewayType.CreditCard} />
        </Element>
      ))}
    </Card>
  );
}
