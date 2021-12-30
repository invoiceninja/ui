/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { defaultHeaders } from 'common/queries/common/headers';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
    { name: t('create_payment_term'), href: '/settings/payment_terms/create' },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'create_payment_term'
    )}`;
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      num_days: 0,
    },
    onSubmit: (values: Partial<PaymentTerm>) => {
      toast.loading(t('processing'));

      axios
        .post(endpoint('/api/v1/payment_terms'), values, {
          headers: defaultHeaders,
        })
        .then((response: AxiosResponse) => {
          toast.dismiss();
          toast.success(t('created_payment_term'));

          navigate(
            generatePath('/settings/payment_terms/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => console.log(error))
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('payment_terms')}>
      <Container className="space-y-6">
        <Breadcrumbs pages={pages} />
        
        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_payment_term')}
        >
          <CardContainer>
            <InputField
              value={formik.values.num_days}
              type="number"
              id="num_days"
              label={t('number_of_days')}
              onChange={formik.handleChange}
            />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}
