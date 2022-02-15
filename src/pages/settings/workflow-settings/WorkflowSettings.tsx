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
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import {
  injectInChanges,
  resetChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import { Invoices, Quotes } from './components';

export function WorkflowSettings() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('workflow_settings'), href: '/settings/workflow_settings' },
  ];

  const dispatch = useDispatch();
  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'workflow_settings'
    )}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

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

  const onCancel = () => {
    dispatch(resetChanges('company'));
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('workflow_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#workflow_settings"
    >
      <Invoices />
      <Quotes />
    </Settings>
  );
}
