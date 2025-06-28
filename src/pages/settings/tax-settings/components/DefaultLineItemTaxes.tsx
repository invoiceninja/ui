/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Card, Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useTaxRatesQuery } from '$app/common/queries/tax-rates';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useColorScheme } from '$app/common/colors';

export function DefaultLineItemTaxes() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);

  const { data } = useTaxRatesQuery({ perPage: 100, status: ['active'] });

  const handlePropertyChange = useHandleCurrentCompanyChangeProperty();

  const handleChange = (
    propertyIndex: '1' | '2' | '3',
    nameValue: string,
    rateValue: number
  ) => {
    if (!nameValue) {
      handlePropertyChange(`settings.tax_name${propertyIndex}`, '');
      handlePropertyChange(`settings.tax_rate${propertyIndex}`, 0);
    } else {
      handlePropertyChange(`settings.tax_name${propertyIndex}`, nameValue);
      handlePropertyChange(`settings.tax_rate${propertyIndex}`, rateValue);
    }
  };

  if (
    !Number(companyChanges.enabled_item_tax_rates) ||
    Number(companyChanges.enabled_tax_rates)
  ) {
    return null;
  }

  return (
    <Card className="shadow-sm" style={{ borderColor: colors.$24 }}>
      {companyChanges?.enabled_item_tax_rates > 0 && data && (
        <Element leftSide={t('default_item_tax_rate')}>
          <SelectField
            value={
              companyChanges?.settings?.tax_name1
                ? `${companyChanges?.settings?.tax_name1}|%|${companyChanges?.settings?.tax_rate1}`
                : ''
            }
            onValueChange={(value) =>
              handleChange(
                '1',
                value.split('|%|')?.[0],
                Number(value.split('|%|')?.[1] || 0)
              )
            }
            withBlank
            errorMessage={errors?.errors['settings.tax_rate1']}
            customSelector
          >
            {data.data.data.map((taxRate: TaxRate) => (
              <option
                key={taxRate.id}
                value={`${taxRate.name}|%|${taxRate.rate}`}
              >
                {taxRate.rate}% — {taxRate.name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {companyChanges?.enabled_item_tax_rates > 1 && data && (
        <Element leftSide={t('default_item_tax_rate')}>
          <SelectField
            value={
              companyChanges?.settings?.tax_name2
                ? `${companyChanges?.settings?.tax_name2}|%|${companyChanges?.settings?.tax_rate2}`
                : ''
            }
            onValueChange={(value) =>
              handleChange(
                '2',
                value.split('|%|')?.[0],
                Number(value.split('|%|')?.[1] || 0)
              )
            }
            withBlank
            errorMessage={errors?.errors['settings.tax_rate2']}
            customSelector
          >
            {data.data.data.map((taxRate: TaxRate) => (
              <option
                key={taxRate.id}
                value={`${taxRate.name}|%|${taxRate.rate}`}
              >
                {taxRate.rate}% — {taxRate.name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}

      {companyChanges?.enabled_item_tax_rates > 2 && data && (
        <Element leftSide={t('default_item_tax_rate')}>
          <SelectField
            value={
              companyChanges?.settings?.tax_name3
                ? `${companyChanges?.settings?.tax_name3}|%|${companyChanges?.settings?.tax_rate3}`
                : ''
            }
            onValueChange={(value) =>
              handleChange(
                '3',
                value.split('|%|')?.[0],
                Number(value.split('|%|')?.[1] || 0)
              )
            }
            withBlank
            errorMessage={errors?.errors['settings.tax_rate3']}
            customSelector
          >
            {data.data.data.map((taxRate: TaxRate) => (
              <option
                key={taxRate.id}
                value={`${taxRate.name}|%|${taxRate.rate}`}
              >
                {taxRate.rate}% — {taxRate.name}
              </option>
            ))}
          </SelectField>
        </Element>
      )}
    </Card>
  );
}
