/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { useTranslation } from 'react-i18next';
import { Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { Field } from '../components';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useHandleCustomSurchargeFieldChange } from '$app/common/hooks/useHandleCustomSurchargeFieldChange';
import { useSetSurchageTaxValue } from '$app/pages/invoices/common/hooks/useSetSurchargeTaxValue';
import { Divider } from '$app/components/cards/Divider';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useColorScheme } from '$app/common/colors';

export function Invoices() {
  const [t] = useTranslation();

  const disabledCustomFields = useShouldDisableCustomFields();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const handleChange = useHandleCustomFieldChange();
  const handleCustomSurchargeFieldChange =
    useHandleCustomSurchargeFieldChange();

  const surchargeValue = (index: number) => {
    switch (index) {
      case 0:
        return company?.custom_surcharge_taxes1;
      case 1:
        return company?.custom_surcharge_taxes2;
      case 2:
        return company?.custom_surcharge_taxes3;
      case 3:
        return company?.custom_surcharge_taxes4;
    }
  };

  const setSurchargeTaxValue = useSetSurchageTaxValue();

  if (!company) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6">
      {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
        <Field
          key={field}
          field={field}
          placeholder={t('invoice_field')}
          onChange={(value) => handleChange(field, value)}
          initialValue={company.custom_fields[field]}
          withArrowAsSeparator
        />
      ))}

      <div className="py-4">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      {company &&
        ['surcharge1', 'surcharge2', 'surcharge3', 'surcharge4'].map(
          (field, index) => (
            <Element
              key={index}
              leftSide={
                <InputField
                  className="w-full sm:w-4/6"
                  id={field}
                  value={company.custom_fields[field]}
                  placeholder={t('surcharge_field')}
                  onValueChange={(value) =>
                    handleCustomSurchargeFieldChange(field, value)
                  }
                  disabled={disabledCustomFields}
                />
              }
              noExternalPadding
              twoGridColumns
            >
              {Boolean(company?.enabled_tax_rates) && (
                <Toggle
                  label={t('charge_taxes')}
                  checked={surchargeValue(index)}
                  onChange={() => setSurchargeTaxValue(index)}
                />
              )}
            </Element>
          )
        )}
    </div>
  );
}
