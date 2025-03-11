/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer, Element } from '$app/components/cards';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { usePaymentTermQuery } from '$app/common/queries/payment-terms';
import { Badge } from '$app/components/Badge';
import { Container } from '$app/components/Container';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Actions } from './components/Actions';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { NumberInputField } from '$app/components/forms/NumberInputField';

export function Edit() {
  useTitle('payment_terms');

  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('payment_settings'), href: '/settings/online_payments' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
    {
      name: t('edit_payment_term'),
      href: route('/settings/payment_terms/:id/edit', { id }),
    },
  ];

  const { data } = usePaymentTermQuery({ id });

  const invalidatePaymentTermCache = () => {
    $refetch(['payment_terms']);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      num_days: data?.data.data.num_days || 0,
    },
    onSubmit: (values: Partial<PaymentTerm>) => {
      toast.processing();

      request(
        'PUT',
        endpoint('/api/v1/payment_terms/:id', { id: data?.data.data.id }),
        values
      )
        .then(() => toast.success('updated_payment_term'))
        .finally(() => {
          formik.setSubmitting(false);
          invalidatePaymentTermCache();
        });
    },
  });

  return (
    <Settings
      title={t('payment_terms')}
      breadcrumbs={pages}
      navigationTopRight={data && <Actions paymentTerm={data.data.data} />}
    >
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container breadcrumbs={[]}>
          <Card
            title={data.data.data.name}
            disableSubmitButton={formik.isSubmitting}
            onFormSubmit={formik.handleSubmit}
            withSaveButton
          >
            <Element leftSide="Status">
              {!data.data.data.is_deleted && !data.data.data.archived_at && (
                <Badge variant="primary">{t('active')}</Badge>
              )}

              {data.data.data.archived_at && !data.data.data.is_deleted ? (
                <Badge variant="yellow">{t('archived')}</Badge>
              ) : null}

              {data.data.data.is_deleted && (
                <Badge variant="red">{t('deleted')}</Badge>
              )}
            </Element>

            <CardContainer>
              <NumberInputField
                precision={0}
                value={formik.values.num_days || ''}
                label={t('number_of_days')}
                onValueChange={(value) =>
                  formik.setFieldValue('num_days', value)
                }
                disablePrecision
              />
            </CardContainer>
          </Card>
        </Container>
      )}
    </Settings>
  );
}
