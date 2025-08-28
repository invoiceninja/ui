/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { useAtomValue } from 'jotai';
import { CloudUpload } from '$app/components/icons/CloudUpload';
import { useColorScheme } from '$app/common/colors';
import { docuCompanyAccountDetailsAtom } from '$app/pages/documents/Document';
import { Button } from '$app/components/forms';
import { Trash } from '$app/components/icons/Trash';
import { Element } from '$app/components/cards';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { ErrorMessage } from '$app/components/ErrorMessage';

function DeleteLogo() {
  const [t] = useTranslation();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const removeLogo = () => {
    if (!isFormBusy) {
      const currentFormData = new FormData();
      currentFormData.append('logo', '');

      toast.processing();
      setIsFormBusy(true);

      request(
        'POST',
        docuNinjaEndpoint('/api/companies/:id/logo', {
          id: docuCompanyAccountDetails?.company?.id,
        }),
        currentFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
        .then(() => {
          $refetch(['docuninja_login']);
          toast.success('removed_logo');
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <Button behavior="button" type="secondary" onClick={removeLogo}>
      <div className="flex items-center space-x-2">
        <div>
          <Trash size="1rem" color="#ef4444" />
        </div>

        <span className="text-sm text-red-500">{t('remove_logo')}</span>
      </div>
    </Button>
  );
}

export default function Logo() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const docuCompanyAccountDetails = useAtomValue(docuCompanyAccountDetailsAtom);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const uploadLogo = (currentFormData: FormData) => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'POST',
        docuNinjaEndpoint('/api/companies/:id/logo', {
          id: docuCompanyAccountDetails?.company?.id,
        }),
        currentFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
        .then(() => {
          $refetch(['docuninja_login']);
          toast.success('uploaded_logo');
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append('logo', acceptedFiles[0]);

    uploadLogo(formData);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: {
      'image/*': ['.jpeg', '.png'],
    },
  });

  return (
    <div className="flex flex-col space-y-5 px-4 sm:px-6 py-4">
      <Element leftSide={t('logo')}>
        <div className="grid grid-cols-12 gap-x-4">
          <div className="bg-gray-200 col-span-6 rounded-lg p-6">
            <img
              src={
                docuCompanyAccountDetails?.company?.logo ||
                '/docuninja-images/logo.png'
              }
              alt={t('company_logo') as string}
            />
          </div>

          <div className="col-span-6 bg-gray-900 rounded-lg p-6">
            <img
              src={
                docuCompanyAccountDetails?.company?.logo ||
                '/docuninja-images/logo.png'
              }
              alt={t('company_logo') as string}
            />
          </div>
        </div>
      </Element>

      <Element leftSide={t('upload_logo')}>
        <div className="flex flex-col space-y-3">
          <div
            {...getRootProps()}
            className="flex flex-col md:flex-row md:items-center cursor-pointer"
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

          <ErrorMessage>{errors?.errors.logo}</ErrorMessage>

          <div className="self-end">
            <DeleteLogo />
          </div>
        </div>
      </Element>
    </div>
  );
}
