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
import { useTitle } from '$app/common/hooks/useTitle';
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useHandleCompanySave } from '../../common/hooks/useHandleCompanySave';
import { useHandleCustomSurchargeFieldChange } from '$app/common/hooks/useHandleCustomSurchargeFieldChange';
import { useSetSurchageTaxValue } from '$app/pages/invoices/common/hooks/useSetSurchargeTaxValue';

export function Invoices() {
  const { documentTitle } = useTitle('custom_fields');

  const [t] = useTranslation();

  const disabledCustomFields = useShouldDisableCustomFields();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('invoices'), href: '/settings/custom_fields/invoices' },
  ];

  const company = useCurrentCompany();
  const handleChange = useHandleCustomFieldChange();
  const handleCustomSurchargeFieldChange =
    useHandleCustomSurchargeFieldChange();
  const save = useHandleCompanySave();

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

  return (
    <Settings
      title={documentTitle}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#custom_fields"
      onSaveClick={save}
    >
      <CustomFieldsPlanAlert />

      <Card title={`${t('custom_fields')}: ${t('invoices')}`}>
        {['invoice1', 'invoice2', 'invoice3', 'invoice4'].map((field) => (
          <Field
            key={field}
            field={field}
            placeholder={t('invoice_field')}
            onChange={(value) => handleChange(field, value)}
            initialValue={company.custom_fields[field]}
          />
        ))}
      </Card>

      <Card>
        {company &&
          ['surcharge1', 'surcharge2', 'surcharge3', 'surcharge4'].map(
            (field, index) => (
              <Element
                noExternalPadding
                key={index}
                leftSide={
                  <InputField
                    id={field}
                    value={company.custom_fields[field]}
                    placeholder={t('surcharge_field')}
                    onValueChange={(value) =>
                      handleCustomSurchargeFieldChange(field, value)
                    }
                    disabled={disabledCustomFields}
                  />
                }
              >
                <Toggle
                  label={t('charge_taxes')}
                  checked={surchargeValue(index)}
                  onChange={() => setSurchargeTaxValue(index)}
                />
              </Element>
            )
          )}
      </Card>
    </Settings>
  );
}
