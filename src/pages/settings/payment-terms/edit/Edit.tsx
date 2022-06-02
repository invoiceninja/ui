/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useTitle } from 'common/hooks/useTitle';
import { PaymentTerm } from 'common/interfaces/payment-term';
import { bulk, usePaymentTermQuery } from 'common/queries/payment-terms';
import { Badge } from 'components/Badge';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import { Actions } from './components/Actions';

export function Edit() {
  useTitle('payment_terms');

  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
    {
      name: t('edit_payment_term'),
      href: generatePath('/settings/payment_terms/:id/edit', { id }),
    },
  ];

  const { data } = usePaymentTermQuery({ id });
  const queryClient = useQueryClient();

  const invalidatePaymentTermCache = () => {
    queryClient.invalidateQueries(
      generatePath('/api/v1/payment_terms/:id', { id })
    );
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      num_days: data?.data.data.num_days || 0,
    },
    onSubmit: (values: Partial<PaymentTerm>) => {
      toast.loading(t('processing'));

      request(
        'PUT',
        endpoint('/api/v1/payment_terms/:id', { id: data?.data.data.id }),
        values
      )
        .then(() => {
          toast.dismiss();
          toast.success(t('updated_payment_term'));
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        })
        .finally(() => {
          formik.setSubmitting(false);
          invalidatePaymentTermCache();
        });
    },
  });

  const archive = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_payment_term'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() => invalidatePaymentTermCache());
  };

  const restore = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'restore')
      .then(() => {
        toast.dismiss();
        toast.success(t('restored_payment_term'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() => invalidatePaymentTermCache());
  };

  const _delete = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'delete')
      .then(() => {
        toast.dismiss();
        toast.success(t('deleted_payment_term'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() => invalidatePaymentTermCache());
  };

  return (
    <Settings title={t('payment_terms')}>
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container className="space-y-6">
          <Breadcrumbs pages={pages} />

          <Card
            title={data.data.data.name}
            disableSubmitButton={formik.isSubmitting}
            onFormSubmit={formik.handleSubmit}
            additionalAction={<Actions paymentTerm={data.data.data} />}
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
      )}
    </Settings>
  );
}
