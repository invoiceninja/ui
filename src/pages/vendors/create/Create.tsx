/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Card } from '@invoiceninja/cards';
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { defaultHeaders } from 'common/queries/common/headers';
import { useBlankVendorQuery } from 'common/queries/vendor';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Address } from '../components/Address';
import { Contacts } from '../components/Contacts';
import { Details } from '../components/Details';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';

export function Create() {
  const [t] = useTranslation();

  const { data: vendor } = useBlankVendorQuery();
  const [errors, setErrors] = useState<ValidationBag>();
  const queryClient = useQueryClient();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: vendor?.data.data.name,
      number: vendor?.data.data.number,
      user_id: vendor?.data.data.user_id,
      id_number: vendor?.data.data.id_number,
      vat_number: vendor?.data.data.vat_number,
      website: vendor?.data.data.website,
      phone: vendor?.data.data.phone,
      address1: vendor?.data.data.address1,
      address2: vendor?.data.data.address2,
      city: vendor?.data.data.city,
      state: vendor?.data.data.state,
      postal_code: vendor?.data.data.postal_code,
      country_id: vendor?.data.data.country_id,
      currency_id: vendor?.data.data.currency_id,
      private_notes: vendor?.data.data.private_notes,
      public_notes: vendor?.data.data.public_notes,
      contacts: vendor?.data.data.contacts,
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      axios
        .post(endpoint('/api/v1/vendors/'), values, {
          headers: defaultHeaders,
        })
        .then(() => {
          toast.success(t('added_vendor'), { id: toastId });
        })
        .catch((error: AxiosError) => {
          console.error(error);
          toast.error(t('error_title'), { id: toastId });
          if (error.response?.status === 422) {
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries(generatePath('/api/v1/vendors'));
        });
    },
  });
  const pages = [
    { name: t('vendors'), href: '/vendors' },
    {
      name: vendor?.data.data.number,
      href: generatePath('/vendors/'),
    },
  ];

  return (
    <Default title={t('vendor')} breadcrumbs={pages} docsLink="docs/vendors/">
      <Container>
        <Card
          disableSubmitButton={formik.isSubmitting}
          onFormSubmit={formik.handleSubmit}
          withSaveButton
        >
          <Details data={formik.values} formik={formik} errors={errors} />
          <Address data={formik.values} formik={formik} errors={errors} />
          <AdditionalInfo
            data={formik.values}
            formik={formik}
            errors={errors}
          />
          <Contacts formik={formik} data={formik.values.contacts} />
        </Card>
      </Container>
    </Default>
  );
}
