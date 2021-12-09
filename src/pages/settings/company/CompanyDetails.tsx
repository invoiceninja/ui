/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { CompanyService } from 'common/services/company.service';
import { updateCompany } from 'common/stores/slices/company';
import { RootState } from 'common/stores/store';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Container from 'typedi';
import { Settings } from '../../../components/layouts/Settings';
import { Address, Defaults, Details, Documents, Logo } from './components';

export function CompanyDetails() {
  const [t] = useTranslation();
  const companyState = useSelector((state: RootState) => state.company);
  const companyService = Container.get(CompanyService);
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'company_details'
    )}`;
  });

  function onSave() {
    toast.loading(t('processing'));

    companyService
      .update(companyState.api.id, companyState.api)
      .then((response: AxiosResponse) => {
        dispatch(updateCompany(response.data.data));

        toast.dismiss();
        toast.success(t('updated_settings'));
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      });
  }

  function onCancel() {}

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
