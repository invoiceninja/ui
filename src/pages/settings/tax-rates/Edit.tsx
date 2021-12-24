/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, CardContainer, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useTaxRateQuery } from 'common/queries/tax-rates';
import { Badge } from 'components/Badge';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { Spinner } from 'components/Spinner';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useTaxRateQuery({ id });
  const [errors, setErrors] = useState<any>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${
      data?.data.data.name
    }`;
  }, [data]);

  const formik = useFormik({
    initialValues: {
      name: data?.data.data.name || '',
      rate: data?.data.data.rate || 0,
    },
    onSubmit: (value) => {
      setErrors(undefined);
      toast.loading(t('processing'));

      axios
        .put(endpoint('/api/v1/tax_rates/:id', { id }), value, {
          headers: defaultHeaders,
        })
        .then(() => {
          queryClient.invalidateQueries(
            generatePath('/api/v1/tax_rates/:id', { id })
          );

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
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('tax_rates')}>
      {!data && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && (
        <Container className="space-y-6">
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
                errorMessage={errors?.errors.name}
              />

              <InputField
                type="text"
                id="rate"
                label={t('rate')}
                onChange={formik.handleChange}
                errorMessage={errors?.errors.rate}
              />
            </CardContainer>
          </Card>
        </Container>
      )}
    </Settings>
  );
}
