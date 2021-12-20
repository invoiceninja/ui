/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company';
import { RootState } from 'common/stores/store';
import { Card } from 'components/cards/Card';
import { Element } from 'components/cards/Element';
import { InputField } from 'components/forms/InputField';
import { SelectField } from 'components/forms/SelectField';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export function Details() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const { data } = useStaticsQuery();
  const dispatch = useDispatch();

  const companyState = useSelector((state: RootState) => state.company);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({ property: event.target.id, value: event.target.value })
    );

  return (
    <>
      {company?.settings && (
        <Card title={t('details')}>
          <Element leftSide={t('name')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('name')
                  ? companyState.changes?.settings?.name
                  : company.settings.name || ''
              }
              onChange={handleChange}
              id="settings.name"
            />
          </Element>
          <Element leftSide={t('id_number')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('id_number')
                  ? companyState.changes?.settings?.id_number
                  : company.settings.id_number || ''
              }
              onChange={handleChange}
              id="settings.id_number"
            />
          </Element>
          <Element leftSide={t('vat_number')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('vat_number')
                  ? companyState.changes?.settings?.vat_number
                  : company.settings.vat_number || ''
              }
              onChange={handleChange}
              id="settings.vat_number"
            />
          </Element>
          <Element leftSide={t('website')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('website')
                  ? companyState.changes?.settings?.website
                  : company.settings.website || ''
              }
              onChange={handleChange}
              id="settings.website"
            />
          </Element>
          <Element leftSide={t('email')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('email')
                  ? companyState.changes?.settings?.email
                  : company.settings.email || ''
              }
              onChange={handleChange}
              id="settings.email"
            />
          </Element>
          <Element leftSide={t('phone')}>
            <InputField
              value={
                companyState.changes?.settings?.hasOwnProperty('phone')
                  ? companyState.changes?.settings?.phone
                  : company.settings.phone || ''
              }
              onChange={handleChange}
              id="settings.phone"
            />
          </Element>
          <Element leftSide={t('size_id')}>
            <SelectField
              value={
                companyState.changes?.hasOwnProperty('size_id')
                  ? companyState.changes?.size_id
                  : company.size_id || '1'
              }
              onChange={handleChange}
              id="size_id"
            >
              {data?.data.sizes.map((size: { id: string; name: string }) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </SelectField>
          </Element>
          <Element leftSide={t('industry_id')}>
            <SelectField
              value={
                companyState.changes?.hasOwnProperty('industry_id')
                  ? companyState.changes?.industry_id
                  : company.industry_id || '1'
              }
              onChange={handleChange}
              id="industry_id"
            >
              {data?.data.industries.map(
                (industry: { id: string; name: string }) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                )
              )}
            </SelectField>
          </Element>
        </Card>
      )}
    </>
  );
}
