/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { Container } from 'components/Container';
import { Modal } from 'components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
interface Props {
  isVisible: boolean;
  onClose: any;
}
export function TaxCreate(props: Props) {
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const formik = useFormik({
    initialValues: {
      name: '',
      rate: '',
    },
    onSubmit: (values) => {
      setErrors({});

      axios
        .post(endpoint('/api/v1/tax_rates'), values, {
          headers: defaultHeaders,
        })
        .then(() => {
          toast.success(t('created_tax_rate'));
          props.onClose(false)

          queryClient.invalidateQueries('/api/v1/payment_terms');
        })
        .catch((error: AxiosError) => {
          console.error(error);

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error(t('error_title'));
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
      <Container className="space-y-6">
        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_tax_rate')}
        >
          <CardContainer>
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
              label={t('rate')}
              errorMessage={errors?.errors?.rate}
              onChange={formik.handleChange}
              required
            />
          </CardContainer>
        </Card>
      </Container>
    </Modal>
  );
}
