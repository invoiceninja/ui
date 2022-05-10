/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import {
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { TaxRates } from '..';
import { Card, Element } from '../../../components/cards';
import { SelectField } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { Selector } from './components';

export function TaxSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
  ];

  const company = useCurrentCompany();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('tax_settings')}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

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

  const onSave = () => {
    toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
      companyChanges
    )
      .then((response: AxiosResponse) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        toast.dismiss();
        toast.success(t('updated_settings'));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      });
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
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

        <Element leftSide={t('item_tax_rates')}>
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

        <Element
          leftSide={t('inclusive_taxes')}
          leftSideHelp={
            <span className="flex flex-col">
              <span>{t('exclusive')}: 100 + 10% = 100 + 10</span>
              <span>{t('inclusive')}: 100 + 10% = 90.91 + 9.09</span>
            </span>
          }
        >
          <Toggle
            onChange={(value: boolean) =>
              handleToggleChange('settings.inclusive_taxes', value)
            }
            checked={companyChanges?.settings?.inclusive_taxes || false}
          />
        </Element>
      </Card>

      <Selector />

      <TaxRates />
    </Settings>
  );
}
