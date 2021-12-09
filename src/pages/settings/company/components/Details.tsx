/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company';
import { RootState } from 'common/stores/store';
import { Card } from 'components/cards/Card';
import { Element } from 'components/cards/Element';
import { InputField } from 'components/forms/InputField';
import { SelectField } from 'components/forms/SelectField';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export function Details() {
  const [t] = useTranslation();
  const company = useSelector((state: RootState) => state.company);
  const { data } = useStaticsQuery();
  const dispatch = useDispatch();
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    setIsDirty(company.isDirty);
  }, [company.isDirty]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(
      updateChanges({ property: event.target.id, value: event.target.value })
    );
  }

  return (
    <>
      {company.api?.settings && (
        <Card title={t('details')}>
          <Element leftSide={t('name')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.name
                  : company.api.settings.name || ''
              }
              onChange={handleChange}
              id="settings.name"
            />
          </Element>
          <Element leftSide={t('id_number')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.id_number
                  : company.api.settings.id_number || ''
              }
              onChange={handleChange}
              id="settings.id_number"
            />
          </Element>
          <Element leftSide={t('vat_number')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.vat_number
                  : company.api.settings.vat_number || ''
              }
              onChange={handleChange}
              id="settings.vat_number"
            />
          </Element>
          <Element leftSide={t('website')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.website
                  : company.api.settings.website || ''
              }
              onChange={handleChange}
              id="settings.website"
            />
          </Element>
          <Element leftSide={t('email')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.email
                  : company.api.settings.email || ''
              }
              onChange={handleChange}
              id="settings.email"
            />
          </Element>
          <Element leftSide={t('phone')}>
            <InputField
              value={
                isDirty
                  ? company.changes?.settings?.phone
                  : company.api.settings.phone || ''
              }
              onChange={handleChange}
              id="settings.phone"
            />
          </Element>
          <Element leftSide={t('size_id')}>
            <SelectField
              value={isDirty ? company.changes?.size_id : company.api.size_id}
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
                isDirty ? company.changes?.industry_id : company.api.industry_id
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
