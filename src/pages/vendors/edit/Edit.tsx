/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Vendor } from '$app/common/interfaces/vendor';
import { useVendorQuery } from '$app/common/queries/vendor';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Form } from './components/Form';

export function Edit() {
  const { documentTitle } = useTitle('edit_vendor');

  const [t] = useTranslation();

  const { id } = useParams();
  const { data } = useVendorQuery({ id });

  const [vendor, setVendor] = useState<Vendor>();

  const [errors, setErrors] = useState<ValidationBag>();

  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('edit_vendor'), href: route('/vendors/:id/edit', { id }) },
  ];

  useEffect(() => {
    if (data) {
      setVendor({ ...data });
    }
  }, [data]);

  const onSave = () => {
    toast.processing();

    axios
      .all([
        request('PUT', endpoint('/api/v1/vendors/:id', { id }), vendor),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('updated_vendor');

        queryClient.invalidateQueries('/api/v1/vendors');

        queryClient.invalidateQueries(route('/api/v1/vendors/:id', { id }));

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        } else {
          console.error(error);
          toast.error();
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/vendors"
      onSaveClick={onSave}
    >
      {vendor && <Form vendor={vendor} setVendor={setVendor} errors={errors} />}
    </Default>
  );
}
