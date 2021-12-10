/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { AxiosError, AxiosResponse } from 'axios';
import { useStaticsQuery } from 'common/queries/statics';
import { CompanyService } from 'common/services/company.service';
import { updateCompany } from 'common/stores/slices/company';
import { RootState } from 'common/stores/store';
import { useFormik } from 'formik';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import toast from 'react-hot-toast';
import { dispatch } from 'react-hot-toast/dist/core/store';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Container from 'typedi';

export function Logo() {
  const [t] = useTranslation();
  const [logo, setLogo] = useState<File>();
  const company = useSelector((state: RootState) => state.company.current);
  const companyService = Container.get(CompanyService);
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      company_logo: logo,
    },
    onSubmit: (values) => {
      toast.loading(t('processing'));

      companyService
        .updateLogo(company.id, values)
        .then((response: AxiosResponse) => {
          dispatch(updateCompany(response.data.data));

          toast.dismiss();
          toast.success(t('uploaded_logo'));
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        });
    },
  });

  const onDrop = useCallback((acceptedFiles) => {
    setLogo(acceptedFiles[0]);

    formik.submitForm();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
    accept: 'image/jpeg, image/png',
  });

  return (
    <Card title={t('logo')}>
      <Element leftSide={t('logo')}>
        <div className="grid grid-cols-12 lg:gap-4 space-y-4 lg:space-y-0">
          <div className="bg-gray-200 col-span-12 lg:col-span-5 rounded-lg p-6">
            <img
              src="http://localhost:3000/src/resources/images/invoiceninja-logo@light.png"
              alt={t('company_logo')}
            />
          </div>

          <div className="col-span-12 lg:col-span-5 bg-gray-900 rounded-lg p-6">
            <img
              src="http://localhost:3000/src/resources/images/invoiceninja-logo@light.png"
              alt={t('company_logo')}
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
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {isDragActive
                ? 'drop_your_logo_here'
                : 'drop_new_logo_here_or_click_to_select'}
            </span>
          </div>
        </div>
      </Element>
    </Card>
  );
}
