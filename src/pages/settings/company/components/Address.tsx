/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { updateChanges } from '$app/common/stores/slices/company-users';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { CountrySelector } from '$app/components/CountrySelector';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';

export function Address() {
  const [t] = useTranslation();

  const dispatch = useDispatch();
  const disableSettingsField = useDisableSettingsField();
  const handleChangeCompanyProperty = useHandleCurrentCompanyChangeProperty();

  const companyChanges = useCompanyChanges();
  const errors = useAtomValue(companySettingsErrorsAtom);

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
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="address1"
                labelElement={<SettingsLabel label={t('address1')} />}
              />
            }
          >
            <InputField
              value={companyChanges?.settings?.address1 || ''}
              onChange={handleChange}
              id="settings.address1"
              disabled={disableSettingsField('address1')}
              errorMessage={errors?.errors['settings.address1']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="address2"
                labelElement={<SettingsLabel label={t('address2')} />}
              />
            }
          >
            <InputField
              value={companyChanges?.settings?.address2 || ''}
              onChange={handleChange}
              id="settings.address2"
              disabled={disableSettingsField('address2')}
              errorMessage={errors?.errors['settings.address2']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="city"
                labelElement={<SettingsLabel label={t('city')} />}
              />
            }
          >
            <InputField
              value={companyChanges?.settings?.city || ''}
              onChange={handleChange}
              id="settings.city"
              disabled={disableSettingsField('city')}
              errorMessage={errors?.errors['settings.city']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="state"
                labelElement={<SettingsLabel label={t('state')} />}
              />
            }
          >
            <InputField
              value={companyChanges?.settings?.state || ''}
              onChange={handleChange}
              id="settings.state"
              disabled={disableSettingsField('state')}
              errorMessage={errors?.errors['settings.state']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="postal_code"
                labelElement={<SettingsLabel label={t('postal_code')} />}
              />
            }
          >
            <InputField
              value={companyChanges?.settings?.postal_code || ''}
              onChange={handleChange}
              id="settings.postal_code"
              disabled={disableSettingsField('postal_code')}
              errorMessage={errors?.errors['settings.postal_code']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="country_id"
                labelElement={<SettingsLabel label={t('country')} />}
              />
            }
          >
            <CountrySelector
              value={companyChanges?.settings?.country_id || ''}
              onChange={(value) =>
                handleChangeCompanyProperty('settings.country_id', value)
              }
              disabled={disableSettingsField('country_id')}
              dismissable
              errorMessage={errors?.errors['settings.country_id']}
            />
          </Element>
        </Card>
      )}
    </>
  );
}
