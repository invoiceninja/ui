/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { updateChanges } from 'common/stores/slices/company-users';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TaxRates } from '..';
import { Card, Element } from '../../../components/cards';
import { SelectField } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { Selector } from './components';

export function TaxSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
  ];

  useInjectCompanyChanges();
  useTitle('tax_settings');

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
      docsLink="docs/basic-settings/#tax_settings"
    >
      <Card title={t('tax_settings')}>
        <Element leftSide={t('invoice_tax_rates')}>
          <SelectField
            id="enabled_tax_rates"
            onChange={handleChange}
            value={companyChanges?.enabled_tax_rates || 0}
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
      </Card>

      <Selector />

      <TaxRates />
    </Settings>
  );
}
