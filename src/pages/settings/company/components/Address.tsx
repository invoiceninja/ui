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
import { RootState } from '$app/common/stores/store';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { SearchableSelect } from '$app/components/SearchableSelect';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';

export function Address() {
  const [t] = useTranslation();
  const { data: statics } = useStaticsQuery();

  const companyChanges = useSelector(
    (state: RootState) => state.companyUsers.changes.company
  );

  const errors = useAtomValue(companySettingsErrorsAtom);


      const handleChange = useHandleCurrentCompanyChangeProperty()

  return (
    <>
      {companyChanges?.settings && (
        <Card title={t('address')}>
          <Element leftSide={t('address1')}>
            <InputField
              value={companyChanges?.settings?.address1 || ''}
              onValueChange={(v) => handleChange('settings.address1', v)}
              id="settings.address1"
              errorMessage={errors?.errors['settings.address1']}
            />
          </Element>

          <Element leftSide={t('address2')}>
            <InputField
              value={companyChanges?.settings?.address2 || ''}
              onValueChange={(v) => handleChange('settings.address2', v)}
              id="settings.address2"
              errorMessage={errors?.errors['settings.address2']}
            />
          </Element>

          <Element leftSide={t('city')}>
            <InputField
              value={companyChanges?.settings?.city || ''}
              onValueChange={(v) => handleChange('settings.city', v)}
              id="settings.city"
              errorMessage={errors?.errors['settings.city']}
            />
          </Element>

          <Element leftSide={t('state')}>
            <InputField
              value={companyChanges?.settings?.state || ''}
              onValueChange={(v) => handleChange('settings.state', v)}
              id="settings.state"
              errorMessage={errors?.errors['settings.state']}
            />
          </Element>

          <Element leftSide={t('postal_code')}>
            <InputField
              value={companyChanges?.settings?.postal_code || ''}
              onValueChange={(v) => handleChange('settings.postal_code', v)}
              id="settings.postal_code"
              errorMessage={errors?.errors['settings.postal_code']}
            />
          </Element>

          <Element leftSide={t('country')}>
            <SearchableSelect
              value={companyChanges?.settings?.country_id || ''}
              onValueChange={(v) => handleChange('settings.country_id', v)}
              errorMessage={errors?.errors['settings.country_id']}
            >
              <option value=""></option>
              {statics?.countries.map((size: { id: string; name: string }) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </SearchableSelect>
          </Element>
        </Card>
      )}
    </>
  );
}
