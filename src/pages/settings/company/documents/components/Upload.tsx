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
import { useFormik } from 'formik';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { isHosted } from '$app/common/helpers';
import { Alert } from '$app/components/Alert';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { Link } from '$app/components/forms';
import { toast } from '$app/common/helpers/toast/toast';
import { MdInfoOutline } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { route } from '$app/common/helpers/route';
import { CloudUpload } from '$app/components/icons/CloudUpload';
import styled from 'styled-components';
import { ErrorMessage } from '$app/components/ErrorMessage';

interface Props {
  endpoint: string;
  onSuccess?: () => unknown;
  widgetOnly?: boolean;
  disableUpload?: boolean;
}

const Box = styled.div`
  border-color: ${(props) => props.theme.borderColor};
  &:hover {
    border-color: ${(props) => props.theme.hoverBorderColor};
  }
`;

export function Upload(props: Props) {
  const [t] = useTranslation();

  const { disableUpload = false } = props;

  const user = useCurrentUser();
  const colors = useColorScheme();

  const [formData, setFormData] = useState(new FormData());

  const [errors, setErrors] = useState<ValidationBag>();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      toast.processing();
      setErrors(undefined);

      request('POST', props.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then(() => {
          toast.success('uploaded_document');

          setFormData(new FormData());

          props.onSuccess?.();
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }

          setFormData(new FormData());
        });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: (!enterprisePlan() && isHosted()) || disableUpload,
    onDrop: (acceptedFiles) => {
      formData.append('_method', 'PUT');

      acceptedFiles.forEach((file) => formData.append('documents[]', file));

      setFormData(formData);

      formik.submitForm();
    },
  });

  if (props.widgetOnly) {
    return (
      <>
        {!enterprisePlan() && isHosted() && (
          <Alert className="mb-4" type="warning" disableClosing>
            <div className="flex items-center">
              <MdInfoOutline className="mr-2" fontSize={20} />

              {t('upgrade_to_upload_images')}

              {user?.company_user && (
                <Link
                  className="ml-10"
                  to={route('/settings/account_management')}
                >
                  {t('plan_change')}
                </Link>
              )}
            </div>
          </Alert>
        )}

        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
        >
          <Box
            className="relative block w-full border-2 border-dashed rounded-lg p-12 text-center"
            theme={{
              borderColor: colors.$21,
              hoverBorderColor: colors.$17,
            }}
          >
            <input {...getInputProps()} />

            <div className="flex justify-center">
              <CloudUpload size="2.3rem" color={colors.$3} />
            </div>

            <span
              className="mt-3 block text-sm font-medium"
              style={{ color: colors.$17 }}
            >
              {isDragActive
                ? t('drop_file_here')
                : t('dropzone_default_message')}
            </span>
          </Box>
        </div>

        {errors &&
          Object.keys(errors.errors).map((key, index) => (
            <ErrorMessage key={index} className="mt-2">
              {errors.errors[key]}
            </ErrorMessage>
          ))}
      </>
    );
  }

  return (
    <>
      {!enterprisePlan() && isHosted() && (
        <Alert className="mb-4" type="warning" disableClosing>
          <div className="flex items-center">
            <MdInfoOutline className="mr-2" fontSize={20} />

            {t('upgrade_to_upload_images')}

            {user?.company_user && (
              <Link
                className="ml-10"
                to={route('/settings/account_management')}
              >
                {t('plan_change')}
              </Link>
            )}
          </div>
        </Alert>
      )}

      <Card title={t('upload')}>
        <Element leftSide={t('upload')}>
          <div
            {...getRootProps()}
            className="flex flex-col md:flex-row md:items-center"
          >
            <Box
              className="relative block w-full border-2 border-dashed rounded-lg p-12 text-center"
              theme={{
                borderColor: colors.$21,
                hoverBorderColor: colors.$17,
              }}
            >
              <input {...getInputProps()} />
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <span
                className="mt-2 block text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {isDragActive
                  ? 'drop_file_here'
                  : t('dropzone_default_message')}
              </span>
            </Box>
          </div>
        </Element>
      </Card>
    </>
  );
}
