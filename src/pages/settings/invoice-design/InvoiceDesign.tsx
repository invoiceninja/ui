/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { defaultHeaders } from 'common/queries/common/headers';
import { resetChanges, updateRecord } from 'common/stores/slices/company-users';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import { Sortable, GeneralSettings } from './components';

export function InvoiceDesign() {
  useTitle('invoice_design');

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const companyChanges = useInjectCompanyChanges();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
  ];

  const onSave = () => {
    toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
        companyChanges,
        { headers: defaultHeaders }
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

  return (
    <Settings
      title={t('invoice_design')}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
    >
      <GeneralSettings />

      <Sortable cardTitle={t('client_details')} />
      <Sortable cardTitle={t('company_details')} />
      <Sortable cardTitle={t('company_address')} />
      <Sortable cardTitle={t('invoice_details')} />
      <Sortable cardTitle={t('quote_details')} />
      <Sortable cardTitle={t('credit_details')} />
      <Sortable cardTitle={t('product_columns')} />
      <Sortable cardTitle={t('task_column')} />
      <Sortable cardTitle={t('total_fields')} />
    </Settings>
  );
}
