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
import { updateCompanyRecord } from 'common/stores/slices/company';
import { RootState } from 'common/stores/store';
import { useFormik } from 'formik';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Element } from '../../../../components/cards';

export function Documents() {
  const [t] = useTranslation();
  const [files, setFiles] = useState<File[]>();
  const company = useSelector((state: RootState) => state.company.current);
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      documents: files,
    },
    onSubmit: (values) => {
      toast.loading(t('processing'));

      axios
        .put(
          endpoint('/api/v1/companies/:id/upload', { id: company.company.id }),
          values,
          {
            headers: {
              'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN') as string,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response: AxiosResponse) => {
          toast.dismiss();
          toast.success(t('successfully_uploaded_documents'));

          dispatch(updateCompanyRecord(response.data.data));
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.dismiss();
          toast.success(t('error_title'));
        });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);

      formik.submitForm();
    },
  });

  return (
    <Card title={t('documents')}>
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
                : 'drag_and_drop_files_here'}
            </span>
          </div>
        </div>
      </Element>
    </Card>
  );
}
