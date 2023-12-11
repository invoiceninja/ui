/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { AxiosResponse } from 'axios';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useFormik } from 'formik';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLogo } from '$app/common/hooks/useLogo';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { DeleteLogo } from './DeleteLogo';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { endpoint } from '$app/common/helpers';
import { useAtomValue } from 'jotai';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { useConfigureGroupSettings } from '../../group-settings/common/hooks/useConfigureGroupSettings';
import { useConfigureClientSettings } from '$app/pages/clients/common/hooks/useConfigureClientSettings';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  isSettingsPage?: boolean;
}
export function Logo({ isSettingsPage = true }: Props) {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(new FormData());
  const logo = useLogo();

  const {
    isGroupSettingsActive,
    isCompanySettingsActive,
    isClientSettingsActive,
  } = useCurrentSettingsLevel();

  const activeSettings = useAtomValue(activeSettingsAtom);

  const configureGroupSettings = useConfigureGroupSettings({
    withoutNavigation: true,
  });

  const configureClientSettings = useConfigureClientSettings({
    withoutNavigation: true,
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    onSubmit: () => {
      toast.processing();

      let endpointRoute = '/api/v1/companies/:id';

      let entityId = company.id;

      if (activeSettings) {
        if (isGroupSettingsActive) {
          endpointRoute = '/api/v1/group_settings/:id';
          entityId = activeSettings.id;
        }

        if (isClientSettingsActive) {
          endpointRoute = '/api/v1/clients/:id';
          entityId = activeSettings.id;
        }
      }

      request('POST', endpoint(endpointRoute, { id: entityId }), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response: AxiosResponse) => {
          if (isCompanySettingsActive) {
            dispatch(
              updateRecord({ object: 'company', data: response.data.data })
            );
          }

          if (isGroupSettingsActive) {
            $refetch(['group_settings']);
            configureGroupSettings(response.data.data);
          }

          if (isClientSettingsActive) {
            $refetch(['clients']);
            configureClientSettings(response.data.data);
          }

          toast.success('uploaded_logo');
        })
        .finally(() => setFormData(new FormData()));
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      formData.append('company_logo', acceptedFiles[0]);
      formData.append('_method', 'PUT');

      setFormData(formData);

      formik.submitForm();
    },
    [formData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpeg', '.png'],
    },
  });

  return isSettingsPage ? (
    <Card title={t('logo')}>
      <Element leftSide={t('logo')}>
        <div className="grid grid-cols-12 lg:gap-4 space-y-4 lg:space-y-0">
          <div className="bg-gray-200 col-span-12 lg:col-span-5 rounded-lg p-6">
            <img src={logo} alt={t('company_logo') ?? 'Company logo'} />
          </div>

          <div className="col-span-12 lg:col-span-5 bg-gray-900 rounded-lg p-6">
            <img src={logo} alt={t('company_logo') ?? 'Company logo'} />
          </div>
        </div>
      </Element>

      <Element leftSide={t('upload_logo')}>
        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
        >
          <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <input {...getInputProps()} />
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium">
              {isDragActive
                ? 'drop_your_logo_here'
                : t('dropzone_default_message')}
            </span>
          </div>
        </div>
      </Element>
      <DeleteLogo />
    </Card>
  ) : (
    <div className="flex flex-col space-y-5">
      <span className="text-lg font-medium">{t('upload_logo')}</span>

      <div className="grid grid-cols-12 gap-x-4">
        <div className="bg-gray-200 col-span-6 rounded-lg p-6">
          <img src={logo} alt={t('company_logo') ?? 'Company logo'} />
        </div>

        <div className="col-span-6 bg-gray-900 rounded-lg p-6">
          <img src={logo} alt={t('company_logo') ?? 'Company logo'} />
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
        >
          <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <input {...getInputProps()} />
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium">
              {isDragActive
                ? 'drop_your_logo_here'
                : t('dropzone_default_message')}
            </span>
          </div>
        </div>

        <div className="self-start">
          <DeleteLogo isSettingsPage={false} />
        </div>
      </div>
    </div>
  );
}
