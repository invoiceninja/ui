/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from 'common/helpers/request';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { isHosted } from 'common/helpers';
import { Alert } from 'components/Alert';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { Link } from '@invoiceninja/forms';
import { toast } from 'common/helpers/toast/toast';

interface Props {
  endpoint: string;
  onSuccess?: () => unknown;
  widgetOnly?: boolean;
}

export function Upload(props: Props) {
  const [t] = useTranslation();

  const user = useCurrentUser();

  const [formData, setFormData] = useState(new FormData());

  const showPlanAlert = !enterprisePlan() && isHosted();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      toast.processing();

      request('POST', props.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(() => {
          toast.success('uploaded_document');

          setFormData(new FormData());

          props.onSuccess?.();
        })
        .catch((error) => {
          console.error(error);
          toast.error();
        });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: showPlanAlert,
    onDrop: (acceptedFiles) => {
      formData.append('_method', 'PUT');

      acceptedFiles.forEach((file) => formData.append('documents[]', file));

      setFormData(formData);

      formik.submitForm();
    },
  });

  const planWarning = (
    <Alert className="mb-4" type="warning" disableClosing>
      {t('upgrade_to_upload_images')}

      {user?.company_user && (
        <Link
          className="ml-10"
          external
          to={user.company_user.ninja_portal_url}
        >
          {t('plan_change')}
        </Link>
      )}
    </Alert>
  );

  if (props.widgetOnly) {
    return (
      <>
        {showPlanAlert && planWarning}

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
      </>
    );
  }

  return (
    <>
      {showPlanAlert && planWarning}

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
    </>
  );
}
