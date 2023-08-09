/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '$app/common/queries/statics';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { RootState } from '$app/common/stores/store';
import { Card } from '$app/components/cards/Card';
import { Element } from '$app/components/cards/Element';
import { CustomField } from '$app/components/CustomField';
import { InputField } from '$app/components/forms/InputField';
import { SelectField } from '$app/components/forms/SelectField';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { companySettingsErrorsAtom } from '../../common/atoms';

export function Details() {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const { data: statics } = useStaticsQuery();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  const handleChange = (property: string, value: string) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: property,
        value: value,
      })
    );

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('details')}>
          <Element leftSide={t('company_name')}>
            <InputField
              value={companyChanges?.settings?.name || ''}
              onValueChange={(value) =>
                handleChange('settings.name', value.toString())
              }
              errorMessage={errors?.errors['settings.name']}
            />
          </Element>

          <Element leftSide={t('id_number')}>
            <InputField
              value={companyChanges?.settings?.id_number || ''}
              onValueChange={(value) =>
                handleChange('settings.id_number', value.toString())
              }
              errorMessage={errors?.errors['settings.id_number']}
            />
          </Element>

          <Element leftSide={t('vat_number')}>
            <InputField
              value={companyChanges?.settings?.vat_number || ''}
              onValueChange={(value) =>
                handleChange('settings.vat_number', value.toString())
              }
              errorMessage={errors?.errors['settings.vat_number']}
            />
          </Element>

          <Element leftSide={t('website')}>
            <InputField
              value={companyChanges?.settings?.website || ''}
              onValueChange={(value) =>
                handleChange('settings.website', value.toString())
              }
              errorMessage={errors?.errors['settings.website']}
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              value={companyChanges?.settings?.email || ''}
              onValueChange={(value) =>
                handleChange('settings.email', value.toString())
              }
              errorMessage={errors?.errors['settings.email']}
            />
          </Element>

          <Element leftSide={`${t('company')} ${t('phone')}`}>
            <InputField
              value={companyChanges?.settings?.phone || ''}
              onValueChange={(value) =>
                handleChange('settings.phone', value.toString())
              }
              errorMessage={errors?.errors['settings.phone']}
            />
          </Element>

          {companyChanges?.settings.country_id == '756' ? (
            <>
              <Element leftSide={t('qr_iban')}>
                <InputField
                  value={companyChanges?.settings?.qr_iban || ''}
                  onValueChange={(value) =>
                    handleChange('settings.qr_iban', value.toString())
                  }
                  errorMessage={errors?.errors['settings.qr_iban']}
                />
              </Element>
              <Element leftSide={t('besr_id')}>
                <InputField
                  value={companyChanges?.settings?.besr_id || ''}
                  onValueChange={(value) =>
                    handleChange('settings.besr_id', value.toString())
                  }
                  errorMessage={errors?.errors['settings.besr_id']}
                />
              </Element>
            </>
          ) : (
            ''
          )}

          <Element leftSide={t('size_id')}>
            <SelectField
              value={companyChanges?.size_id || '1'}
              onValueChange={(value) =>
                handleChange('size_id', value.toString())
              }
              errorMessage={errors?.errors.size_id}
            >
              {statics?.sizes.map((size: { id: string; name: string }) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </SelectField>
          </Element>

          <Element leftSide={t('industry_id')}>
            <SelectField
              value={companyChanges?.industry_id || '1'}
              onValueChange={(value) =>
                handleChange('industry_id', value.toString())
              }
              errorMessage={errors?.errors.industry_id}
            >
              {statics?.industries.map(
                (industry: { id: string; name: string }) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                )
              )}
            </SelectField>
          </Element>

          {companyChanges?.custom_fields?.company1 && (
            <CustomField
              field="company1"
              defaultValue={companyChanges.settings.custom_value1}
              value={companyChanges.custom_fields.company1}
              onValueChange={(value) =>
                handleChange('settings.custom_value1', value.toString())
              }
            />
          )}

          {companyChanges?.custom_fields?.company2 && (
            <CustomField
              field="company2"
              defaultValue={companyChanges.settings.custom_value2}
              value={companyChanges.custom_fields.company2}
              onValueChange={(value) =>
                handleChange('settings.custom_value2', value.toString())
              }
            />
          )}

          {companyChanges?.custom_fields?.company3 && (
            <CustomField
              field="company3"
              defaultValue={companyChanges.settings.custom_value3}
              value={companyChanges.custom_fields.company3}
              onValueChange={(value) =>
                handleChange('settings.custom_value3', value.toString())
              }
            />
          )}

          {companyChanges?.custom_fields?.company4 && (
            <CustomField
              field="company4"
              defaultValue={companyChanges.settings.custom_value4}
              value={companyChanges.custom_fields.company4}
              onValueChange={(value) =>
                handleChange('settings.custom_value4', value.toString())
              }
            />
          )}
        </Card>
      )}
    </>
  );
}
