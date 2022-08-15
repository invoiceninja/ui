/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Vendor } from 'common/interfaces/vendor';
import { useVendorQuery } from 'common/queries/vendor';
import { updateRecord } from 'common/stores/slices/company-users';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { generatePath, useParams } from 'react-router-dom';
import { Form } from './components/Form';

export function Edit() {
  const { documentTitle } = useTitle('edit_vendor');

  const [t] = useTranslation();

  const { id } = useParams();
  const { data } = useVendorQuery({ id });

  const [vendor, setVendor] = useState<Vendor>();

  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const pages: BreadcrumRecord[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('edit_vendor'), href: generatePath('/vendors/:id/edit', { id }) },
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

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/vendors/:id', { id })
        )
      );
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/vendors"
      onSaveClick={onSave}
    >
      {vendor && <Form vendor={vendor} setVendor={setVendor} />}
    </Default>
  );
}
