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
import { SelectField } from '$app/components/forms';
import {
  CompanyGateway,
  FeesAndLimitsEntry,
} from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { ChangeEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleFeesAndLimitsEntryChange } from '../hooks/useHandleFeesAndLimitsEntryChange';
import { useResolveGatewayTypeTranslation } from '../hooks/useResolveGatewayTypeTranslation';
import { atom, useAtom } from 'jotai';
import { TaxRateSelector } from '$app/components/tax-rates/TaxRateSelector';
import { Entry } from '$app/components/forms/Combobox';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { NumberInputField } from '$app/components/forms/NumberInputField';

interface Props {
  gateway: Gateway;
  companyGateway: CompanyGateway;
  setCompanyGateway: React.Dispatch<
    React.SetStateAction<CompanyGateway | undefined>
  >;
  errors: ValidationBag | undefined;
}

const currentGatewayTypeAtom = atom<string | undefined>(undefined);

export function LimitsAndFees(props: Props) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const [currentGatewayTypeId, setCurrentGatewayTypeId] = useAtom(
    currentGatewayTypeAtom
  );

  const resolveGatewayTypeTranslation = useResolveGatewayTypeTranslation();
  const handleFeesAndLimitsEntryChange = useHandleFeesAndLimitsEntryChange(
    props.setCompanyGateway
  );

  useEffect(() => {
    const enabled = Object.entries(props.companyGateway.fees_and_limits).filter(
      ([, entry]) => entry.is_enabled
    );

    if (typeof currentGatewayTypeId !== 'undefined' && enabled.length > 0) {
      return;
    }

    enabled.length > 0
      ? setCurrentGatewayTypeId(enabled[0][0])
      : setCurrentGatewayTypeId(undefined);
  }, [props.companyGateway]);

  const handlePaymentTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrentGatewayTypeId(event.target.value);
  };

  const handleEntryChange = (
    field: keyof FeesAndLimitsEntry,
    value: string | number | boolean
  ) => {
    if (currentGatewayTypeId) {
      handleFeesAndLimitsEntryChange(currentGatewayTypeId, field, value);
    }
  };

  return (
    <Card title={t('limits_and_fees')}>
      <Element leftSide={t('payment_type')}>
        <SelectField
          onChange={handlePaymentTypeChange}
          errorMessage={props.errors?.errors.gatewayTypeId}
        >
          {Object.entries(props.companyGateway.fees_and_limits)
            .filter(([, entry]) => entry.is_enabled)
            .map(([gatewayTypeId], index) => (
              <option key={index} value={gatewayTypeId}>
                {resolveGatewayTypeTranslation(gatewayTypeId)}
              </option>
            ))}
        </SelectField>
      </Element>

      {currentGatewayTypeId && (
        <>
          <Divider />

          <Element leftSide={`${t('min')} ${t('limit')}`}>
            <div className="space-y-4">
              <NumberInputField
                value={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.min_limit
                }
                onValueChange={(value) =>
                  handleEntryChange('min_limit', parseFloat(value) || -1)
                }
                disabled={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.min_limit === -1
                }
                errorMessage={props.errors?.errors.min_limit}
              />

              <Toggle
                checked={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.min_limit >= 0
                }
                label={t('enable_min')}
                onValueChange={(value) =>
                  handleEntryChange('min_limit', value ? 0 : -1)
                }
              />
            </div>
          </Element>

          <Element leftSide={`${t('max')} ${t('limit')}`}>
            <div className="space-y-4">
              <NumberInputField
                value={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.max_limit
                }
                onValueChange={(value) =>
                  handleEntryChange('max_limit', parseFloat(value) || -1)
                }
                disabled={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.max_limit === -1
                }
                errorMessage={props.errors?.errors.max_limit}
              />

              <Toggle
                checked={
                  props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                    ?.max_limit >= 0
                }
                label={t('enable_max')}
                onValueChange={(value) =>
                  handleEntryChange('max_limit', value ? 0 : -1)
                }
              />
            </div>
          </Element>

          <Divider />

          <Element leftSide={t('fee_percent')}>
            <NumberInputField
              value={
                props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                  ?.fee_percent
              }
              onValueChange={(value) =>
                handleEntryChange('fee_percent', parseFloat(value))
              }
              errorMessage={props.errors?.errors.fee_percent}
            />
          </Element>

          <Element leftSide={t('fee_amount')}>
            <NumberInputField
              value={
                props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                  ?.fee_amount
              }
              onValueChange={(value) =>
                handleEntryChange('fee_amount', parseFloat(value))
              }
              errorMessage={props.errors?.errors.fee_amount}
            />
          </Element>

          {company && company.enabled_item_tax_rates > 0 && (
            <Element leftSide={t('tax')}>
              <TaxRateSelector
                defaultValue={
                  props.companyGateway?.fees_and_limits[currentGatewayTypeId]
                    ?.fee_tax_name1 || ''
                }
                onChange={(value: Entry<TaxRate>) => {
                  handleEntryChange(
                    'fee_tax_name1',
                    value.resource?.name || ''
                  );
                  handleEntryChange('fee_tax_rate1', value.resource?.rate || 0);
                }}
                onClearButtonClick={() => {
                  handleEntryChange('fee_tax_name1', '');
                  handleEntryChange('fee_tax_rate1', 0);
                }}
                onTaxCreated={(taxRate) => {
                  handleEntryChange('fee_tax_name1', taxRate.name);
                  handleEntryChange('fee_tax_rate1', taxRate.rate);
                }}
              />
            </Element>
          )}

          {company && company.enabled_item_tax_rates > 1 && (
            <Element leftSide={t('tax')}>
              <TaxRateSelector
                defaultValue={
                  props.companyGateway?.fees_and_limits[currentGatewayTypeId]
                    ?.fee_tax_name2 || ''
                }
                onChange={(value: Entry<TaxRate>) => {
                  handleEntryChange(
                    'fee_tax_name2',
                    value.resource?.name || ''
                  );
                  handleEntryChange('fee_tax_rate2', value.resource?.rate || 0);
                }}
                onClearButtonClick={() => {
                  handleEntryChange('fee_tax_name2', '');
                  handleEntryChange('fee_tax_rate2', 0);
                }}
                onTaxCreated={(taxRate) => {
                  handleEntryChange('fee_tax_name2', taxRate.name);
                  handleEntryChange('fee_tax_rate2', taxRate.rate);
                }}
              />
            </Element>
          )}

          {company && company.enabled_item_tax_rates > 2 && (
            <Element leftSide={t('tax')}>
              <TaxRateSelector
                defaultValue={
                  props.companyGateway?.fees_and_limits[currentGatewayTypeId]
                    ?.fee_tax_name3 || ''
                }
                onChange={(value: Entry<TaxRate>) => {
                  handleEntryChange(
                    'fee_tax_name3',
                    value.resource?.name || ''
                  );
                  handleEntryChange('fee_tax_rate3', value.resource?.rate || 0);
                }}
                onClearButtonClick={() => {
                  handleEntryChange('fee_tax_name3', '');
                  handleEntryChange('fee_tax_rate3', 0);
                }}
                onTaxCreated={(taxRate) => {
                  handleEntryChange('fee_tax_name3', taxRate.name);
                  handleEntryChange('fee_tax_rate3', taxRate.rate);
                }}
              />
            </Element>
          )}

          <Element leftSide={t('fee_cap')}>
            <NumberInputField
              value={
                props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                  ?.fee_cap
              }
              onValueChange={(value) =>
                handleEntryChange('fee_cap', parseFloat(value))
              }
              errorMessage={props.errors?.errors.fee_cap}
            />
          </Element>

          <Element leftSide={t('adjust_fee_percent')}>
            <Toggle
              checked={
                props.companyGateway.fees_and_limits?.[currentGatewayTypeId]
                  ?.adjust_fee_percent
              }
              label={t('adjust_fee_percent_help')}
              onValueChange={(value) =>
                handleEntryChange('adjust_fee_percent', value)
              }
            />
          </Element>
        </>
      )}
    </Card>
  );
}
