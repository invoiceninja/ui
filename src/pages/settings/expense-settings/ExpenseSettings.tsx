/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { Divider } from 'components/cards/Divider';
import { ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Card, Element } from '../../../components/cards';
import { Radio } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import { ExpenseCategories } from '../expense-categories';

export function ExpenseSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
  ];

  const dispatch = useDispatch();
  const company = useCurrentCompany();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'expense_settings'
    )}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

  const companyChanges = useCompanyChanges();

  const handleToggleChange = (id: string, value: boolean) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: id,
        value,
      })
    );

  const onSave = () => {
    toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
      companyChanges
    )
      .then((response) => {
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

  const onCancel = () => {
    dispatch(resetChanges('company'));
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('expense_settings')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#expense_settings"
    >
      <Card title={t('settings')}>
        <Element
          leftSide={t('should_be_invoiced')}
          leftSideHelp={t('should_be_invoiced_help')}
        >
          <Toggle
            checked={companyChanges?.mark_expenses_invoiceable}
            onChange={(value: boolean) =>
              handleToggleChange('mark_expenses_invoiceable', value)
            }
          />
        </Element>

        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle
            checked={companyChanges?.mark_expenses_paid}
            onChange={(value: boolean) =>
              handleToggleChange('mark_expenses_paid', value)
            }
          />
        </Element>

        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle
            checked={companyChanges?.invoice_expense_documents}
            onChange={(value: boolean) =>
              handleToggleChange('invoice_expense_documents', value)
            }
          />
        </Element>

        <Divider />

        <Element leftSide={t('enter_taxes')}>
          <Radio
            onClick={(event: ChangeEvent<HTMLInputElement>) =>
              dispatch(
                updateChanges({
                  object: 'company',
                  property: 'calculate_expense_tax_by_amount',
                  value: event.target.value === 'true' ? true : false,
                })
              )
            }
            options={[
              { id: 'by_rate', title: t('by_rate'), value: 'false' },
              { id: 'by_amount', title: t('by_amount'), value: 'true' },
            ]}
            name="calculate_expense_tax_by_amount"
            defaultSelected={companyChanges?.calculate_expense_tax_by_amount.toString()}
          />
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
              handleToggleChange('expense_inclusive_taxes', value)
            }
            checked={companyChanges?.expense_inclusive_taxes || false}
          />
        </Element>
      </Card>

      <ExpenseCategories />
    </Settings>
  );
}
