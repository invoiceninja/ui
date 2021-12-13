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
import { useCompany } from 'common/hooks/useCompany';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { updateCompanyRecord } from 'common/stores/slices/company';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Settings } from '../../../components/layouts/Settings';
import { Address, Defaults, Details, Documents, Logo } from './components';

export function CompanyDetails() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'company_details'
    )}`;
  });

  const dispatch = useDispatch();
  const currentCompany = useCurrentCompany();
  const company = useCompany(currentCompany?.id);

  const onSave = () => {
    toast.loading(t('processing'));

    axios
      .put(
        endpoint('/api/v1/companies/:id', { id: currentCompany.id }),
        currentCompany,
        {
          headers: {
            'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN') as string,
          },
        }
      )
      .then((response: AxiosResponse) => {
        dispatch(updateCompanyRecord(response.data.data));

        toast.dismiss();
        toast.success(t('updated_settings'));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      });
  };

  const onCancel = () => dispatch(updateCompanyRecord(company));

  return (
    <Settings
      onSaveClick={onSave}
      onCancelClick={onCancel}
      title={t('company_details')}
    >
      <div className="space-y-6 mt-6">
        <Details />
        <Logo />
        <Address />
        <Defaults />
        <Documents />
      </div>
    </Settings>
  );
}
