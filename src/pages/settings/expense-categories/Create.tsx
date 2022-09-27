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
import { InputField, InputLabel } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Settings } from 'components/layouts/Settings';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function Create() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<Record<string, any>>({});

  useTitle('new_expense_category');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('expense_settings'), href: '/settings/expense_settings' },
    {
      name: t('new_expense_category'),
      href: '/settings/expense_categories/create',
    },
  ];

  const formik = useFormik({
    initialValues: {
      name: '',
      color: '',
    },
    onSubmit: (values) => {
      setErrors({});
      toast.loading(t('processing'));

      request('POST', endpoint('/api/v1/expense_categories'), values)
        .then((response) => {
          toast.dismiss();
          toast.success(t('created_expense_category'));

          navigate(
            route('/settings/expense_categories/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError) => {
          toast.dismiss();

          error.response?.status === 422
            ? setErrors(error.response?.data)
            : toast.error(t('error_title'));
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <Settings title={t('expense_categories')}>
      <Container>
        <Breadcrumbs pages={pages} />

        <Card
          withSaveButton
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          title={t('create_expense_category')}
        >
          <CardContainer>
            <InputField
              id="name"
              label={t('name')}
              onChange={formik.handleChange}
              errorMessage={errors?.errors?.name}
              required
            />

            <InputLabel>{t('color')}</InputLabel>
            <input type="color" id="color" onChange={formik.handleChange} />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}
