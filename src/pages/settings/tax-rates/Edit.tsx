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
import { InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { useTaxRateQuery } from '$app/common/queries/tax-rates';
import { Badge } from '$app/components/Badge';
import { Container } from '$app/components/Container';
import { Settings } from '$app/components/layouts/Settings';
import { Spinner } from '$app/components/Spinner';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '$app/components/Breadcrumbs';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useActions } from '$app/pages/settings/tax-rates/common/hooks/useActions';
import { ResourceActions } from '$app/components/ResourceActions';
import { useTitle } from '$app/common/hooks/useTitle';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Edit() {
  const { setDocumentTitle } = useTitle('edit_tax_rate');

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

  const actions = useActions();

  useEffect(() => {
    setDocumentTitle(data?.data.data.name);
  }, [data]);

  const invalidatePaymentTermCache = () => {
    $refetch(['tax_rates']);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.data.data.name || '',
      rate: data?.data.data.rate || 0,
    },
    onSubmit: (value) => {
      setErrors({});
      toast.processing();

      request('PUT', endpoint('/api/v1/tax_rates/:id', { id }), value)
        .then(() => toast.success('updated_tax_rate'))
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
          invalidatePaymentTermCache();
        });
    },
  });

  return (
    <Settings
      title={t('tax_rates')}
      navigationTopRight={
        data && (
          <ResourceActions
            label={t('more_actions')}
            resource={data.data.data}
            actions={actions}
          />
        )
      }
    >
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
                type="number"
                id="rate"
                label={t('tax_rate')}
                onChange={formik.handleChange}
                errorMessage={errors?.errors?.rate}
                value={formik.values.rate}
              />
            </CardContainer>
          </Card>
        </Container>
      )}
    </Settings>
  );
}
