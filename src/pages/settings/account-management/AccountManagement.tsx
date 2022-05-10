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
  updateRecord,
} from 'common/stores/slices/company-users';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import {
  EnabledModules,
  Integrations,
  Overview,
  Plan,
  SecuritySettings,
} from './component';
import { DangerZone } from './component/DangerZone';

export function AccountManagement() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
  ];

  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'account_management'
    )}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

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

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
      title={t('account_management')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#account_management"
    >
      <Plan />
      <Overview />
      <EnabledModules />
      <Integrations />
      <SecuritySettings />
      <DangerZone />
    </Settings>
  );
}
