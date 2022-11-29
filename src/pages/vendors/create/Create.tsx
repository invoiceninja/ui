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
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Vendor } from 'common/interfaces/vendor';
import { useBlankVendorQuery } from 'common/queries/vendor';
import { updateRecord } from 'common/stores/slices/company-users';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form } from '../edit/components/Form';

export function Create() {
  const { documentTitle } = useTitle('create_vendor');

  const [t] = useTranslation();

  const { data } = useBlankVendorQuery();

  const [vendor, setVendor] = useState<Vendor>();

  const company = useInjectCompanyChanges();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    {
      name: t('create_vendor'),
      href: '/vendors/:id/create',
    },
  ];

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
          },
        ],
      });
    }
  }, [data]);

  const onSave = () => {
    toast.processing();

    axios
      .all([
        request('POST', endpoint('/api/v1/vendors'), vendor),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('created_vendor');

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );

        console.error(response);

        navigate(route('/vendors/:id', { id: response[0].data.data.id }));
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
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
