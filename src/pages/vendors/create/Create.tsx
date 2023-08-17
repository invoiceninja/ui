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
import { useBlankVendorQuery } from '$app/common/queries/vendor';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form } from '../edit/components/Form';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';

export default function Create() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('create_vendor');

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    {
      name: t('create_vendor'),
      href: '/vendors/:id/create',
    },
  ];

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data } = useBlankVendorQuery();
  const { isAdmin } = useAdmin();

  const queryClient = useQueryClient();
  const company = useInjectCompanyChanges();

  const [vendor, setVendor] = useState<Vendor>();
  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (data) {
      setVendor({
        ...data,
        country_id: '',
        contacts: [
          {
            id: '',
            first_name: '',
            last_name: '',
            email: '',
            send_email: true,
            created_at: 0,
            updated_at: 0,
            archived_at: 0,
            is_primary: false,
            phone: '',
            custom_value1: '',
            custom_value2: '',
            custom_value3: '',
            custom_value4: '',
            link: '',
            last_login: 0,
          },
        ],
      });
    }
  }, [data]);

  const handleSave = () => {
    toast.processing();

    const requests = [request('POST', endpoint('/api/v1/vendors'), vendor)];

    if (isAdmin) {
      requests.push(
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        )
      );
    }

    axios
      .all(requests)
      .then((response) => {
        toast.success('created_vendor');

        queryClient.invalidateQueries('/api/v1/vendors');

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/vendors'),
            },
          })
        );

        if (isAdmin) {
          dispatch(
            updateRecord({ object: 'company', data: response[1].data.data })
          );
        }

        navigate(route('/vendors/:id', { id: response[0].data.data.id }));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={vendor && handleSave}
    >
      {vendor && <Form vendor={vendor} setVendor={setVendor} errors={errors} />}
    </Default>
  );
}
