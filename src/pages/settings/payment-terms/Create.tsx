/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
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

      request('POST', endpoint('/api/v1/payment_terms'), values)
        .then((response: AxiosResponse) => {
          toast.dismiss();
          toast.success(t('created_payment_term'));

          navigate(
            route('/settings/payment_terms/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => console.error(error))
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
