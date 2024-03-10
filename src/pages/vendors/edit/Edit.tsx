/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Vendor } from '$app/common/interfaces/vendor';
import { useVendorQuery } from '$app/common/queries/vendor';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Form } from './components/Form';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks/useActions';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { cloneDeep, set } from 'lodash';
import { VendorContact } from '$app/common/interfaces/vendor-contact';
import { $refetch } from '$app/common/hooks/useRefetch';

export default function Edit() {
  const { documentTitle } = useTitle('edit_vendor');

  const [t] = useTranslation();

  const { id } = useParams();
  const { data } = useVendorQuery({ id });

  const [vendor, setVendor] = useState<Vendor>();

  const [errors, setErrors] = useState<ValidationBag>();

  const [contacts, setContacts] = useState<Partial<VendorContact>[]>([]);

  const actions = useActions();

  const pages: Page[] = [
    { name: t('vendors'), href: '/vendors' },
    { name: t('edit_vendor'), href: route('/vendors/:id/edit', { id }) },
  ];

  useEffect(() => {
    if (data) {
      setVendor({ ...data });

      setContacts(cloneDeep(data.contacts));
    }
  }, [data]);

  const saveCompany = useHandleCompanySave();

  const onSave = async () => {
    set(vendor as Vendor, 'contacts', contacts);
    toast.processing();

    await saveCompany(true);

    request('PUT', endpoint('/api/v1/vendors/:id', { id }), vendor)
      .then(() => {
        toast.success('updated_vendor');

        $refetch(['vendors']);
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
      navigationTopRight={
        vendor && (
          <ResourceActions
            onSaveClick={onSave}
            resource={vendor}
            actions={actions}
          />
        )
      }
    >
      {vendor && (
        <Form
          vendor={vendor}
          setVendor={setVendor}
          errors={errors}
          contacts={contacts}
          setContacts={setContacts}
          page="edit"
        />
      )}
    </Default>
  );
}
