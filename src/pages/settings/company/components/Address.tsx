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
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export function Address() {
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
        <Card title={t('address')}>
          <Element leftSide={t('address1')}>
            <InputField
              onChange={handleChange}
              value={
                companyState.changes?.settings?.hasOwnProperty('address1')
                  ? companyState.changes?.settings?.address1
                  : company.settings.address1 || ''
              }
              id="settings.address1"
            />
          </Element>
          <Element leftSide={t('address2')}>
            <InputField
              onChange={handleChange}
              value={
                companyState.changes?.settings?.hasOwnProperty('address2')
                  ? companyState.changes?.settings?.address2
                  : company.settings.address2 || ''
              }
              id="settings.address2"
            />
          </Element>
          <Element leftSide={t('city')}>
            <InputField
              onChange={handleChange}
              value={
                companyState.changes?.settings?.hasOwnProperty('city')
                  ? companyState.changes?.settings?.city
                  : company.settings.city || ''
              }
              id="settings.city"
            />
          </Element>
          <Element leftSide={t('state')}>
            <InputField
              onChange={handleChange}
              value={
                companyState.changes?.settings?.hasOwnProperty('state')
                  ? companyState.changes?.settings?.state
                  : company.settings.state || ''
              }
              id="settings.state"
            />
          </Element>
          <Element leftSide={t('postal_code')}>
            <InputField
              onChange={handleChange}
              value={
                companyState.changes?.settings?.hasOwnProperty('postal_code')
                  ? companyState.changes?.settings?.postal_code
                  : company.settings.postal_code || ''
              }
              id="settings.postal_code"
            />
          </Element>
          <Element leftSide={t('country')}>
            <SelectField
              value={
                companyState.changes?.settings?.hasOwnProperty('country_id')
                  ? companyState.changes?.settings?.country_id
                  : company.settings.country_id || ''
              }
              onChange={handleChange}
              id="settings.country_id"
            >
              <option value=""></option>
              {data?.data.countries.map(
                (size: { id: string; name: string }) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
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
