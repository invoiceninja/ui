/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ActionCard, Card, CardContainer, Element } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { bulk, useTaxRateQuery } from 'common/queries/tax-rates';
import { Badge } from 'components/Badge';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
    {
      name: t('edit_tax_rate'),
      href: route('/settings/tax_rates/:id/edit', { id }),
    },
  ];

  const { data } = useTaxRateQuery({ id });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.name
    }`;
  }, [data]);

  const invalidatePaymentTermCache = () => {
    queryClient.invalidateQueries(
      route('/api/v1/tax_rates/:id', { id })
    );
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.data.data.name || '',
      rate: data?.data.data.rate || 0,
    },
    onSubmit: (value) => {
      setErrors({});
      toast.loading(t('processing'));

      request('PUT', endpoint('/api/v1/tax_rates/:id', { id }), value)
        .then(() => {
          toast.dismiss();
          toast.success(t('updated_tax_rate'));
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.dismiss();

          error.response?.status === 422
            ? setErrors(error.response.data)
            : toast.error(t('error_title'));
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
        toast.success(t('archived_tax_rate'));
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
        toast.success(t('restored_tax_rate'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() => invalidatePaymentTermCache());
  };

  const destroy = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'delete')
      .then(() => {
        toast.dismiss();
        toast.success(t('deleted_tax_rate'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() => invalidatePaymentTermCache());
  };

  return (
    <Settings title={t('tax_rates')}>
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container className="space-y-6">
          <Breadcrumbs pages={pages} />

          <Card
            withSaveButton
            onFormSubmit={formik.handleSubmit}
            disableSubmitButton={formik.isSubmitting}
            title={data.data.data.name}
          >
            <Element leftSide={t('status')}>
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
                type="text"
                id="name"
                label={t('name')}
                onChange={formik.handleChange}
                errorMessage={errors?.errors?.name}
                value={formik.values.name}
              />

              <InputField
                type="text"
                id="rate"
                label={t('rate')}
                onChange={formik.handleChange}
                errorMessage={errors?.errors?.rate}
                value={formik.values.rate}
              />
            </CardContainer>
          </Card>

          {!data.data.data.archived_at && !data.data.data.is_deleted ? (
            <ActionCard label={t('archive')} help="">
              <Button onClick={archive}>{t('archive')}</Button>
            </ActionCard>
          ) : null}

          {data.data.data.archived_at || data.data.data.is_deleted ? (
            <ActionCard label={t('restore')} help="">
              <Button onClick={restore}>{t('restore')}</Button>
            </ActionCard>
          ) : null}

          {!data.data.data.is_deleted && (
            <ActionCard label={t('delete')} help="">
              <Button onClick={destroy}>{t('delete')}</Button>
            </ActionCard>
          )}
        </Container>
      )}
    </Settings>
  );
}
