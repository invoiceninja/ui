/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { defaultHeaders } from 'common/queries/common/headers';
import { resetChanges, updateRecord } from 'common/stores/slices/company-users';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import { Address, Defaults, Details, Documents, Logo } from './components';

export function CompanyDetails() {
  const [t] = useTranslation();

  useTitle('company_details');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
  ];

  const dispatch = useDispatch();
  const companyChanges = useInjectCompanyChanges();

  const onSave = () => {
    toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/companies/:id', { id: companyChanges?.id }),
        companyChanges,
        { headers: defaultHeaders }
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

  const onCancel = () => {
    dispatch(resetChanges('company'));
  };

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#company_details"
    >
      <Details />
      <Logo />
      <Address />
      <Defaults />
      <Documents />
    </Settings>
  );
}
