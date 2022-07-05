/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from 'common/queries/statics';
import { updateChanges } from 'common/stores/slices/company-users';
import { RootState } from 'common/stores/store';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export function Address() {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();
  const dispatch = useDispatch();

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('address')}>
          <Element leftSide={t('address1')}>
            <InputField
              value={companyChanges?.settings?.address1}
              onChange={handleChange}
              id="settings.address1"
            />
          </Element>

          <Element leftSide={t('address2')}>
            <InputField
              value={companyChanges?.settings?.address2}
              onChange={handleChange}
              id="settings.address2"
            />
          </Element>

          <Element leftSide={t('city')}>
            <InputField
              value={companyChanges?.settings?.city}
              onChange={handleChange}
              id="settings.city"
            />
          </Element>

          <Element leftSide={t('state')}>
            <InputField
              value={companyChanges?.settings?.state}
              onChange={handleChange}
              id="settings.state"
            />
          </Element>

          <Element leftSide={t('postal_code')}>
            <InputField
              value={companyChanges?.settings?.postal_code}
              onChange={handleChange}
              id="settings.postal_code"
            />
          </Element>

          <Element leftSide={t('country')}>
            <SelectField
              value={companyChanges?.settings?.country_id}
              onChange={handleChange}
              id="settings.country_id"
            >
              <option value=""></option>
              {statics?.countries.map((size: { id: string; name: string }) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </SelectField>
          </Element>
        </Card>
      )}
    </>
  );
}
