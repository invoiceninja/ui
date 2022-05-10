/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, Element } from '@invoiceninja/cards';
import { endpoint } from 'common/helpers';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import { updateRecord } from 'common/stores/slices/company-users';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { request } from 'common/helpers/request';

export function Upload({ apiEndpoint }: { apiEndpoint: string }) {
  const [t] = useTranslation();
  const [formData, setFormData] = useState(new FormData());
  const company = useCurrentCompany();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      toast.loading(t('processing'));

      request('POST', endpoint(apiEndpoint, { id: company.id }), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response) => {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );

          toast.dismiss();
          toast.success(t('successfully_uploaded_documents'));

          queryClient.invalidateQueries('/api/v1/documents');

          setFormData(new FormData());
        })
        .catch((error) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      formData.append('_method', 'PUT');

      acceptedFiles.forEach((file) => formData.append('documents[]', file));

      setFormData(formData);

      formik.submitForm();
    },
  });

  return (
    <Card title={t('upload')}>
      <Element leftSide={t('upload')}>
        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
        >
          <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <input {...getInputProps()} />
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {isDragActive
                ? 'drop_your_files_here'
                : t('dropzone_default_message')}
            </span>
          </div>
        </div>
      </Element>
    </Card>
  );
}
