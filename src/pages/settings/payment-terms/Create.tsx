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
import { PaymentTerm } from 'common/interfaces/payment-term';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function Create() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('payment_terms')}`;
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      num_days: 0,
    },
    onSubmit: (values: Partial<PaymentTerm>) => {
      toast.loading(t('processing'));
    },
  });

  return (
    <Settings title="Create">
      <Container className="space-y-6">
        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_a_product_term')}
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
