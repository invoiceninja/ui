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
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { cloneDeep } from 'lodash';
import { useTaxRatesQuery } from '$app/common/queries/tax-rates';

interface Props {
  title?: string;
}
export function Selector(props: Props) {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();

  const handlePropertyChange = useHandleCurrentCompanyChangeProperty();

  const disableSettingsField = useDisableSettingsField();

  const { title } = props;

  const errors = useAtomValue(companySettingsErrorsAtom);

  const { data } = useTaxRatesQuery({ perPage: 100, status: ['active'] });

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const option = event.target.options[event.target.selectedIndex];

    handlePropertyChange(
      event.target.id,
      parseFloat(option.dataset.rate || '0')
    );

    handlePropertyChange(option.dataset.rateName as string, event.target.value);
  };

  const handleRemoveProperty = (propertyKey: string) => {
    const updatedCompanySettings = cloneDeep(companyChanges?.settings);

    delete updatedCompanySettings[propertyKey];

    handlePropertyChange('settings', updatedCompanySettings);
  };

  return (
    <>
      {companyChanges?.enabled_tax_rates > 0 && (
        <Card title={title ? t(title) : undefined}>
          {companyChanges?.enabled_tax_rates > 0 && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="tax_name1"
                  labelElement={<SettingsLabel label={t('default_tax_rate')} />}
                  onCheckboxChange={(value) => {
                    if (value) {
                      handlePropertyChange('settings.tax_rate1', 0);
                    } else {
                      handleRemoveProperty('tax_rate1');
                    }
                  }}
                />
              }
            >
              <SelectField
                id="settings.tax_rate1"
                onChange={handleChange}
                value={companyChanges?.settings?.tax_name1 || 0}
                disabled={disableSettingsField('tax_name1')}
                errorMessage={errors?.errors['settings.tax_rate1']}
              >
                <option
                  data-rate={0}
                  data-rate-name="settings.tax_name1"
                  value="0"
                />
                {data &&
                  data.data.data.map((taxRate: TaxRate) => (
                    <option
                      data-rate={taxRate.rate}
                      data-rate-name="settings.tax_name1"
                      key={taxRate.id}
                      value={taxRate.name}
                    >
                      {taxRate.rate}% — {taxRate.name}
                    </option>
                  ))}
              </SelectField>
            </Element>
          )}

          {companyChanges?.enabled_tax_rates > 1 && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="tax_name2"
                  labelElement={<SettingsLabel label={t('default_tax_rate')} />}
                  onCheckboxChange={(value) => {
                    if (value) {
                      handlePropertyChange('settings.tax_rate2', 0);
                    } else {
                      handleRemoveProperty('tax_rate2');
                    }
                  }}
                />
              }
            >
              <SelectField
                id="settings.tax_rate2"
                onChange={handleChange}
                value={companyChanges?.settings?.tax_name2 || 0}
                disabled={disableSettingsField('tax_name2')}
                errorMessage={errors?.errors['settings.tax_rate2']}
              >
                <option
                  data-rate={0}
                  data-rate-name="settings.tax_name2"
                  value="0"
                />
                {data &&
                  data.data.data.map((taxRate: TaxRate) => (
                    <option
                      data-rate={taxRate.rate}
                      data-rate-name="settings.tax_name2"
                      key={taxRate.id}
                      value={taxRate.name}
                    >
                      {taxRate.rate}% — {taxRate.name}
                    </option>
                  ))}
              </SelectField>
            </Element>
          )}

          {companyChanges?.enabled_tax_rates > 2 && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="tax_name3"
                  labelElement={<SettingsLabel label={t('default_tax_rate')} />}
                  onCheckboxChange={(value) => {
                    if (value) {
                      handlePropertyChange('settings.tax_rate3', 0);
                    } else {
                      handleRemoveProperty('tax_rate3');
                    }
                  }}
                />
              }
            >
              <SelectField
                id="settings.tax_rate3"
                onChange={handleChange}
                value={companyChanges?.settings?.tax_name3 || 0}
                disabled={disableSettingsField('tax_name3')}
                errorMessage={errors?.errors['settings.tax_rate3']}
              >
                <option
                  data-rate={0}
                  data-rate-name="settings.tax_name3"
                  value="0"
                />
                {data &&
                  data.data.data.map((taxRate: TaxRate) => (
                    <option
                      data-rate={taxRate.rate}
                      data-rate-name="settings.tax_name3"
                      key={taxRate.id}
                      value={taxRate.name}
                    >
                      {taxRate.rate}% — {taxRate.name}
                    </option>
                  ))}
              </SelectField>
            </Element>
          )}
        </Card>
      )}
    </>
  );
}
