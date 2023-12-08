/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Modal } from '$app/components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  isVisible: boolean;
  onClose: any;
  onTaxCreated?: (taxRate: TaxRate) => unknown;
}

export function TaxCreate(props: Props) {
  const [errors, setErrors] = useState<ValidationBag>();
  const [t] = useTranslation();

  const formik = useFormik({
    initialValues: {
      name: '',
      rate: '',
    },
    onSubmit: (values) => {
      setErrors(undefined);

      request('POST', endpoint('/api/v1/tax_rates'), values)
        .then((response) => {
          toast.success('created_tax_rate');
          props.onClose(false);

          $refetch(['tax_rates']);

          props.onTaxCreated && props.onTaxCreated(response.data.data);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => formik.setSubmitting(false));
    },
  });
  return (
    <Modal
      title={t('create_tax_rate')}
      visible={props.isVisible}
      onClose={props.onClose}
    >
      <InputField
        type="text"
        id="name"
        label={t('name')}
        errorMessage={errors?.errors?.name}
        onChange={formik.handleChange}
        required
      />

      <InputField
        type="text"
        id="rate"
        label={t('tax_rate')}
        errorMessage={errors?.errors?.rate}
        onChange={formik.handleChange}
        required
      />
      <Button
        behavior="button"
        type="primary"
        onClick={() => {
          formik.submitForm();
        }}
      >
        {t('save')}
      </Button>
    </Modal>
  );
}
