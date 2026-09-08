/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { MdCrop } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { compressImageFileForLogo } from '$app/common/helpers/logo-image';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useLogo } from '$app/common/hooks/useLogo';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  resetChanges,
  updateRecord,
} from '$app/common/stores/slices/company-users';
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { CloudUpload } from '$app/components/icons/CloudUpload';
import { useConfigureClientSettings } from '$app/pages/clients/common/hooks/useConfigureClientSettings';
import { useConfigureGroupSettings } from '../../group-settings/common/hooks/useConfigureGroupSettings';
import { DeleteLogo } from './DeleteLogo';
import { LogoCropModal } from './LogoCropModal';

interface Props {
  isSettingsPage?: boolean;
}

export function Logo({ isSettingsPage = true }: Props) {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const logo = useLogo();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();

  const [pendingImageSrc, setPendingImageSrc] = useState<string>('');
  const [cropModalVisible, setCropModalVisible] = useState<boolean>(false);
  const [isLoadingCropSource, setIsLoadingCropSource] =
    useState<boolean>(false);

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

  const uploadLogo = async (data: FormData) => {
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

    return request('POST', endpoint(endpointRoute, { id: entityId }), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((response: AxiosResponse) => {
      if (isCompanySettingsActive) {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));
        dispatch(resetChanges('company'));
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

      setCropModalVisible(false);

      if (pendingImageSrc) {
        URL.revokeObjectURL(pendingImageSrc);
        setPendingImageSrc('');
      }
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      let preparedFile: File;

      try {
        preparedFile = await compressImageFileForLogo(file);
      } catch {
        toast.error();
        return;
      }

      const formData = new FormData();

      formData.append('company_logo', preparedFile);
      formData.append('_method', 'PUT');

      uploadLogo(formData);
    },
    [uploadLogo]
  );

  const handleCropComplete = useCallback(
    (croppedBlob: Blob): Promise<void> => {
      const croppedFile = new File([croppedBlob], 'company_logo.png', {
        type: 'image/png',
      });

      const newFormData = new FormData();

      newFormData.append('company_logo', croppedFile);
      newFormData.append('_method', 'PUT');

      return uploadLogo(newFormData);
    },
    [uploadLogo]
  );

  const handleCropModalClose = () => {
    if (pendingImageSrc) {
      URL.revokeObjectURL(pendingImageSrc);
      setPendingImageSrc('');
    }

    setCropModalVisible(false);
  };

  const handleOpenCropExistingLogo = async () => {
    if (isLoadingCropSource) {
      return;
    }

    setIsLoadingCropSource(true);
    setCropModalVisible(true);

    request(
      'GET',
      endpoint('/api/v1/companies/:id/logo', { id: company.id }),
      {},
      { responseType: 'blob' }
    )
      .then((response: AxiosResponse) => {
        setPendingImageSrc(URL.createObjectURL(response.data as Blob));
      })
      .catch(() => {
        setCropModalVisible(false);
      })
      .finally(() => {
        setIsLoadingCropSource(false);
      });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpeg', '.png'],
    },
  });

  return (
    <>
      <LogoCropModal
        visible={cropModalVisible}
        imageSrc={pendingImageSrc}
        isLoading={isLoadingCropSource}
        onClose={handleCropModalClose}
        onCropComplete={handleCropComplete}
      />

      {isSettingsPage ? (
        <>
          <Element leftSide={t('logo')}>
            <div className="grid grid-cols-12 lg:gap-4 space-y-4 lg:space-y-0">
              <div
                className="col-span-12 lg:col-span-5 rounded-lg p-6 border"
                style={{ backgroundColor: colors.$15, borderColor: colors.$24 }}
              >
                <img
                  className="w-full h-auto object-contain"
                  src={logo}
                  alt={t('company_logo') ?? 'Company logo'}
                />
              </div>

              <div className="col-span-12 lg:col-span-5 bg-gray-900 rounded-lg p-6">
                <img
                  className="w-full h-auto object-contain"
                  src={logo}
                  alt={t('company_logo') ?? 'Company logo'}
                />
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

                <div className="flex justify-center">
                  <CloudUpload size="2.3rem" color={colors.$3} />
                </div>

                <span className="mt-2 block text-sm font-medium">
                  {isDragActive
                    ? 'drop_your_logo_here'
                    : t('dropzone_default_message')}
                </span>
              </div>
            </div>
          </Element>

          <Element className="pb-3" pushContentToRight noVerticalPadding>
            <div className="flex items-center space-x-3">
              <Button
                behavior="button"
                type="secondary"
                onClick={handleOpenCropExistingLogo}
                disabled={
                  !companyChanges?.settings?.company_logo || isLoadingCropSource
                }
                disableWithoutIcon
              >
                <div className="flex items-center space-x-2">
                  <MdCrop fontSize={16} />

                  <span className="text-sm">{t('crop_logo')}</span>
                </div>
              </Button>

              <DeleteLogo isSettingsPage={false} />
            </div>
          </Element>
        </>
      ) : (
        <div className="flex flex-col space-y-5">
          <span className="text-lg font-medium">{t('upload_logo')}</span>

          <div className="grid grid-cols-12 gap-x-4">
            <div
              className="col-span-6 rounded-lg p-6 border"
              style={{ backgroundColor: colors.$15, borderColor: colors.$24 }}
            >
              <img
                className="w-full h-auto object-contain"
                src={logo}
                alt={t('company_logo') ?? 'Company logo'}
              />
            </div>

            <div className="col-span-6 bg-gray-900 rounded-lg p-6">
              <img
                className="w-full h-auto object-contain"
                src={logo}
                alt={t('company_logo') ?? 'Company logo'}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <div
              {...getRootProps()}
              className="flex flex-col md:flex-row md:items-center"
            >
              <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <input {...getInputProps()} />

                <div className="flex justify-center">
                  <CloudUpload size="2.3rem" color={colors.$3} />
                </div>

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
      )}
    </>
  );
}
