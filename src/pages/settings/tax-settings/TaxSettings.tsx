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
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TaxRates } from '..';
import { Card, Element } from '../../../components/cards';
import { Button, SelectField } from '../../../components/forms';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Selector } from './components';
import { Divider } from '$app/components/cards/Divider';
import { usePaidOrSelfHost } from '$app/common/hooks/usePaidOrSelfhost';
import { CalculateTaxes } from './components/calculate-taxes/CalculateTaxes';
import { useCalculateTaxesRegion } from '$app/common/hooks/useCalculateTaxesRegion';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { CompanyTaxDetails } from './components/CompanyTaxDetails';

export function TaxSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
  ];

  useInjectCompanyChanges();
  useTitle('tax_settings');
  const errors = useAtomValue(companySettingsErrorsAtom);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  
  const dispatch = useDispatch();
  const companyChanges = useCompanyChanges();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );
  };

  const handleToggleChange = (id: string, value: boolean) => {
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );
  };

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('tax_settings')}
      breadcrumbs={pages}
      docsLink="en/basic-settings/#tax_settings"
      withoutBackButton
    >
      <Card title={t('tax_settings')}>
        <Element leftSide={t('invoice_tax_rates')}>
          <SelectField
            id="enabled_tax_rates"
            onChange={handleChange}
            value={companyChanges?.enabled_tax_rates || 0}
            errorMessage={errors?.errors.enabled_tax_rates}
          >
            <option value="0">{t('disabled')}</option>
            <option value="1">{t('one_tax_rate')}</option>
            <option value="2">{t('two_tax_rates')}</option>
            <option value="3">{t('three_tax_rates')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('line_item_tax_rates')}>
          <SelectField
            id="enabled_item_tax_rates"
            onChange={handleChange}
            value={companyChanges?.enabled_item_tax_rates || 0}
            errorMessage={errors?.errors.enabled_item_tax_rates}
          >
            <option value="0">{t('disabled')}</option>
            <option value="1">{t('one_tax_rate')}</option>
            <option value="2">{t('two_tax_rates')}</option>
            <option value="3">{t('three_tax_rates')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('expense_tax_rates')}>
          <SelectField
            id="enabled_expense_tax_rates"
            onChange={handleChange}
            value={companyChanges?.enabled_expense_tax_rates || 0}
            errorMessage={errors?.errors.enabled_expense_tax_rates}
          >
            <option value="0">{t('disabled')}</option>
            <option value="1">{t('one_tax_rate')}</option>
            <option value="2">{t('two_tax_rates')}</option>
            <option value="3">{t('three_tax_rates')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('inclusive_taxes')}>
          <div className="flex items-center space-x-7">
            <Toggle
              onChange={(value: boolean) =>
                handleToggleChange('settings.inclusive_taxes', value)
              }
              checked={companyChanges?.settings.inclusive_taxes || false}
            />

            {companyChanges?.settings.inclusive_taxes ? (
              <span>{t('inclusive')}: 100 + 10% = 90.91 + 9.09</span>
            ) : (
              <span>{t('exclusive')}: 100 + 10% = 100 + 10</span>
            )}
          </div>
        </Element>

        {usePaidOrSelfHost() &&
          useCalculateTaxesRegion(companyChanges?.settings?.country_id) && (
            <>
              <Divider />

              <Element leftSide={t('calculate_taxes')}>
                <div className="flex">
                <Toggle
                  checked={companyChanges?.calculate_taxes}
                  onChange={(value: boolean) =>
                    handleToggleChange('calculate_taxes', value)
                  }
                />

                {companyChanges.calculate_taxes && companyChanges.settings.country_id === '840' &&(

                  <div className="mx-5 my-1">
                    <Button type="minimal" behavior="button"
                      onClick={() => setIsModalVisible(true)}
                    >
                      {t('info')}</Button>
                  </div>
                )}
              </div>
              </Element>
            
              <CompanyTaxDetails
                isModalOpen={isModalVisible}
                setIsModalOpen={setIsModalVisible}
              />

              {companyChanges.calculate_taxes && <CalculateTaxes />}
            </>
          )}
      </Card>
      <Selector />
      <TaxRates />
    </Settings>
  );
}
