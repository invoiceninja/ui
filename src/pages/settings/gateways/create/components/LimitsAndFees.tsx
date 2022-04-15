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
import { Gateway } from 'common/interfaces/statics';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';

interface Props {
  gateway: Gateway;
}

export function LimitsAndFees(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('limits_and_fees')}>
      <Element leftSide={t('payment_type')}>
        <SelectField>
          <option value="">{props.gateway.name} (testing)</option>
        </SelectField>
      </Element>

      <Divider />

      <Element leftSide={`${t('min')} ${t('limit')}`}>
        <div className="space-y-4">
          <InputField />
          <Toggle label={t('enable_min')} />
        </div>
      </Element>

      <Element leftSide={`${t('max')} ${t('limit')}`}>
        <div className="space-y-4">
          <InputField />
          <Toggle label={t('enable_max')} />
        </div>
      </Element>

      <Divider />

      <Element leftSide={t('fee_percent')}>
        <InputField />
      </Element>

      <Element leftSide={t('fee_amount')}>
        <InputField />
      </Element>

      <Element leftSide={t('fee_cap')}>
        <InputField />
      </Element>

      <Element leftSide={t('adjust_fee_percent')}>
        <Toggle label={t('adjust_fee_percent_help')} />
      </Element>
    </Card>
  );
}
